import * as THREE from "three";

// A single sky draw, with a warm horizon and broad sun glow. No post-processing.
export class Atmosphere {
  constructor(scene) {
    this.material = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        zenith: { value: new THREE.Color() },
        horizon: { value: new THREE.Color() },
        sunColor: { value: new THREE.Color() },
        sunStrength: { value: 1 },
      },
      vertexShader: `varying vec3 skyDirection;
        void main() {
          skyDirection = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `varying vec3 skyDirection;
        uniform vec3 zenith, horizon, sunColor;
        uniform float sunStrength;
        void main() {
          vec3 d = normalize(skyDirection);
          float height = smoothstep(-0.05, 0.8, d.y);
          vec3 color = mix(horizon, zenith, pow(height, 0.65));
          float sun = max(dot(d, normalize(vec3(-0.6, 0.45, 0.55))), 0.0);
          color += sunColor * (pow(sun, 28.0) * 0.17 + pow(sun, 400.0) * 0.28) * sunStrength;
          gl_FragColor = vec4(color, 1.0);
          #include <colorspace_fragment>
        }`,
    });
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(180, 24, 16),
      this.material,
    );
    this.mesh.name = "Storybook sky";
    this.mesh.renderOrder = -10;
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
  }
  setLevel(level) {
    const dark = ["night", "crystal"].includes(level.theme);
    const horizon = new THREE.Color(level.sky).lerp(
      new THREE.Color(dark ? "#7872a9" : "#fff1d9"),
      dark ? 0.25 : 0.16,
    );
    this.material.uniforms.zenith.value
      .set(level.sky)
      .multiplyScalar(dark ? 0.65 : 0.95);
    this.material.uniforms.horizon.value.copy(horizon);
    this.material.uniforms.sunColor.value.set(dark ? "#a8bfff" : "#fff2cc");
    this.material.uniforms.sunStrength.value = dark ? 0.08 : 1;
    return horizon;
  }
  update(camera) {
    this.mesh.position.copy(camera.position);
  }
  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.mesh.removeFromParent();
  }
}

// World-space variation stays glued to the terrain as the camera moves.
// This costs one ordinary material pass and avoids external texture downloads.
export function terrainMaterial(
  color,
  { road = false, edge = color, halfwidth = 1, night = false } = {},
) {
  const result = new THREE.MeshStandardMaterial({ color, roughness: 0.96 });
  result.onBeforeCompile = (shader) => {
    shader.uniforms.groundEdge = { value: new THREE.Color(edge) };
    shader.uniforms.roadHalfwidth = { value: halfwidth };
    shader.vertexShader =
      `varying vec3 terrainPosition; varying vec2 terrainUv;\n${shader.vertexShader}`.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nterrainPosition = (modelMatrix * vec4(position, 1.0)).xyz; terrainUv = uv;",
      );
    shader.fragmentShader =
      `varying vec3 terrainPosition; varying vec2 terrainUv;
      uniform vec3 groundEdge; uniform float roadHalfwidth;
      float terrainNoise(vec2 p) {
        vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
        vec2 k = vec2(127.1,311.7);
        float a = fract(sin(dot(i,k))*43758.5453);
        float b = fract(sin(dot(i+vec2(1,0),k))*43758.5453);
        float c = fract(sin(dot(i+vec2(0,1),k))*43758.5453);
        float d = fract(sin(dot(i+vec2(1,1),k))*43758.5453);
        return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
      }\n${shader.fragmentShader}`.replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float patches = terrainNoise(terrainPosition.xz * ${road ? "0.65" : "0.13"});
        float grain = terrainNoise(terrainPosition.xz * ${road ? "13.0" : "3.3"});
        diffuseColor.rgb *= 0.88 + patches * 0.16 + grain * 0.07;
        ${
          road
            ? `float edgeFade = smoothstep(0.84, 1.0, abs(terrainUv.x * 2.0 - 1.0) + (patches - 0.5) * 0.07);
        diffuseColor.rgb = mix(diffuseColor.rgb, groundEdge * (0.92 + patches * 0.12), edgeFade);`
            : ""
        }
      `,
      );
  };
  result.customProgramCacheKey = () => `terrain-${road}-${night}`;
  return result;
}

export function contactShadowMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { opacity: { value: 0.25 } },
    vertexShader: `varying vec2 shadowUv; void main() { shadowUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying vec2 shadowUv; uniform float opacity;
      void main() { float r = length(shadowUv * 2.0 - 1.0); gl_FragColor = vec4(0.16,0.20,0.25, (1.0-smoothstep(0.1,1.0,r))*opacity); }
    `,
  });
}
