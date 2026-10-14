import * as THREE from "three";
import { coursePoint } from "../config/levels.js";
import { geometry, material } from "../art/primitives.js";

const random = (n) => {
  const x = Math.sin(n * 127.1 + 41.7) * 43758.5453;
  return x - Math.floor(x);
};

function grassGeometry() {
  return geometry("grass-cluster", () => {
    const verts = [],
      colors = [];
    for (let i = 0; i < 5; i++) {
      const a = i * 2.4,
        x = Math.cos(a) * 0.14,
        z = Math.sin(a) * 0.14;
      const h = 0.23 + random(i) * 0.32,
        bend = Math.cos(a) * 0.2;
      const points = [
        [x - 0.045, 0, z],
        [x + 0.045, 0, z],
        [x + bend * 0.4 + 0.025, h * 0.55, z + 0.06],
        [x - 0.045, 0, z],
        [x + bend * 0.4 + 0.025, h * 0.55, z + 0.06],
        [x + bend * 0.4 - 0.025, h * 0.55, z + 0.06],
        [x + bend * 0.4 - 0.025, h * 0.55, z + 0.06],
        [x + bend * 0.4 + 0.025, h * 0.55, z + 0.06],
        [x + bend, h, z + 0.1],
      ];
      points.forEach((p) => {
        verts.push(...p);
        const c = 0.64 + (p[1] / h) * 0.36;
        colors.push(c, c, c);
      });
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  });
}

// Spatially chunked instances keep thousands of small plants to a few visible draws.
export function dressVerge(root, level) {
  const length = Math.PI * 2 * level.radius;
  const grassColor = new THREE.Color(level.foliage).lerp(
    new THREE.Color(level.ground),
    0.45,
  );
  const isCloud = level.theme === "cloud";
  const grassMat = new THREE.MeshStandardMaterial({
    color: grassColor,
    vertexColors: true,
    side: THREE.DoubleSide,
    roughness: 0.95,
  });
  const windTime = { value: 0 };
  grassMat.onBeforeCompile = (shader) => {
    shader.uniforms.windTime = windTime;
    shader.vertexShader =
      `uniform float windTime;\n${shader.vertexShader}`.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
      vec4 anchor = instanceMatrix * vec4(0.0,0.0,0.0,1.0);
      float wind = sin(anchor.x*0.43+anchor.z*0.31+windTime*1.7);
      transformed.x += wind * position.y * position.y * 0.28;
      transformed.z += cos(anchor.z*0.27+windTime*1.2) * position.y * position.y * 0.13;`,
      );
  };
  const stoneMat = material(level.theme === "crystal" ? "#9296c5" : "#bdbaa5", {
    roughness: 0.9,
  });
  const dummy = new THREE.Object3D();
  for (let chunk = 0; chunk < 16; chunk++) {
    if (!isCloud) {
      const count = 180;
      const grass = new THREE.InstancedMesh(grassGeometry(), grassMat, count);
      grass.name = "Roadside grass";
      grass.receiveShadow = true;
      for (let i = 0; i < count; i++) {
        const seed = chunk * count + i + level.id * 234;
        const s = ((chunk + random(seed)) / 16) * length;
        const lane =
          (i % 2 ? 1 : -1) *
          (level.width / 2 + 0.25 + Math.pow(random(seed + 30), 2) * 8);
        const p = coursePoint(level, s, lane);
        dummy.position.set(p.x, p.y - 0.045, p.z);
        dummy.rotation.set(0, random(seed + 44) * Math.PI * 2, 0);
        dummy.scale.setScalar(0.65 + random(seed + 19) * 0.9);
        dummy.updateMatrix();
        grass.setMatrixAt(i, dummy.matrix);
        grass.setColorAt(
          i,
          new THREE.Color().setHSL(0, 0, 0.8 + random(seed + 12) * 0.2),
        );
      }
      grass.computeBoundingSphere();
      root.add(grass);
    }
    const stones = new THREE.InstancedMesh(
      geometry("verge-stone", () => new THREE.IcosahedronGeometry(1, 1)),
      stoneMat,
      16,
    );
    stones.name = "Path pebbles";
    stones.receiveShadow = true;
    for (let i = 0; i < 16; i++) {
      const seed = chunk * 23 + i;
      const s = ((chunk + random(seed + 5)) / 16) * length;
      const p = coursePoint(
        level,
        s,
        (i % 2 ? 1 : -1) * (level.width / 2 + 0.4 + random(seed + 6) * 2),
      );
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(random(seed), random(seed + 10) * 6, 0);
      const scale = 0.1 + random(seed + 3) * 0.17;
      dummy.scale.set(scale * 1.5, scale * 0.6, scale);
      dummy.updateMatrix();
      stones.setMatrixAt(i, dummy.matrix);
    }
    stones.computeBoundingSphere();
    root.add(stones);
  }
  return {
    update: (time) => {
      windTime.value = time;
    },
    dispose: () => grassMat.dispose(),
  };
}

export class AmbientMagic {
  constructor(parent, level) {
    this.level = level;
    const positions = [],
      seeds = [];
    for (let i = 0; i < 64; i++) {
      positions.push(0, 0, 0);
      seeds.push(random(i + 7), random(i + 19), random(i + 63));
    }
    this.seeds = seeds;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    const dark = ["night", "forest", "crystal", "spooky"].includes(level.theme);
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        color: { value: new THREE.Color(dark ? "#ffe3a0" : "#fff4d1") },
        brightness: { value: dark ? 0.85 : 0.5 },
      },
      vertexShader: `void main(){vec4 p=modelViewMatrix*vec4(position,1.0); gl_Position=projectionMatrix*p; gl_PointSize=clamp(55.0/-p.z,1.0,5.0);}`,
      fragmentShader: `uniform vec3 color; uniform float brightness;
        void main(){vec2 p=gl_PointCoord*2.0-1.0; float a=1.0-smoothstep(0.0,1.0,length(p)); gl_FragColor=vec4(color,a*brightness);}`,
    });
    this.points = new THREE.Points(geo, mat);
    this.points.name = "Floating fairy lights";
    this.points.frustumCulled = false;
    parent.add(this.points);
  }
  update(time, s) {
    const pos = this.points.geometry.attributes.position;
    for (let i = 0; i < 64; i++) {
      const a = this.seeds[i * 3],
        b = this.seeds[i * 3 + 1],
        c = this.seeds[i * 3 + 2];
      const point = coursePoint(this.level, s - 8 + a * 82, (b - 0.5) * 28);
      pos.setXYZ(
        i,
        point.x + Math.sin(time * 0.25 + i) * 0.4,
        point.y + 0.7 + c * 5 + Math.sin(time * 0.7 + i) * 0.25,
        point.z,
      );
    }
    pos.needsUpdate = true;
  }
  dispose() {
    this.points.geometry.dispose();
    this.points.material.dispose();
  }
}
