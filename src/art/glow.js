import * as THREE from "three";
import { geometry } from "./primitives.js";

// Soft additive halos around magical lights: potions, crystals, lanterns and the
// moon. One instanced batch of camera-facing quads per field; no bloom pass.
export class Glow {
  constructor(parent, capacity, { fadeNear = 45, fadeFar = 125 } = {}) {
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        fadeNear: { value: fadeNear },
        fadeFar: { value: fadeFar },
      },
      vertexShader: `uniform float fadeNear, fadeFar;
        varying vec2 glowUv; varying vec3 glowColor;
        void main() {
          glowUv = position.xy * 2.0;
          vec4 center = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          float size = length(instanceMatrix[0].xyz);
          // Step toward the camera so walls and bottles behind a light do not slice its halo.
          center.xyz += normalize(-center.xyz) * size * 0.4;
          center.xy += position.xy * size;
          glowColor = instanceColor * (1.0 - smoothstep(fadeNear, fadeFar, -center.z));
          gl_Position = projectionMatrix * center;
        }`,
      fragmentShader: `varying vec2 glowUv; varying vec3 glowColor;
        void main() {
          float r = length(glowUv);
          float halo = pow(max(1.0 - r, 0.0), 2.6) + pow(max(1.0 - r * 2.4, 0.0), 2.0) * 0.3;
          gl_FragColor = vec4(glowColor * halo, 1.0);
          #include <colorspace_fragment>
        }`,
    });
    this.mesh = new THREE.InstancedMesh(
      geometry("glow-quad", () => new THREE.PlaneGeometry(1, 1)),
      this.material,
      capacity,
    );
    this.mesh.name = "Magic glow";
    this.mesh.userData.ownedMaterial = true;
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(capacity * 3),
      3,
    );
    this.mesh.count = 0;
    // The batch sits at the world origin, so it sorts as the farthest transparent
    // layer: translucent wings and sparkles blend over halos rather than under them.
    this.mesh.frustumCulled = false;
    this.matrix = new THREE.Matrix4();
    this.color = new THREE.Color();
    parent.add(this.mesh);
  }
  add(position, color, size, strength = 1) {
    if (this.mesh.count >= this.mesh.instanceMatrix.count) return -1;
    const index = this.mesh.count++;
    this.mesh.setColorAt(
      index,
      this.color.set(color).multiplyScalar(strength),
    );
    this.set(index, position, size);
    return index;
  }
  set(index, position, size) {
    if (index < 0) return;
    this.matrix.makeScale(size, size, size).setPosition(position);
    this.mesh.setMatrixAt(index, this.matrix);
    this.mesh.instanceMatrix.needsUpdate = true;
  }
  // Props mark their lamps with userData.glow = { size, strength }. Collect them
  // before baking, while each light still has its own transform.
  collect(root) {
    root.updateWorldMatrix(true, true);
    const position = new THREE.Vector3(),
      scale = new THREE.Vector3();
    root.traverse((o) => {
      const glow = o.userData.glow;
      if (!glow) return;
      o.getWorldPosition(position);
      o.parent.getWorldScale(scale);
      this.add(
        position,
        glow.color ?? o.material.emissive,
        glow.size * scale.x,
        glow.strength ?? 1,
      );
    });
  }
}
