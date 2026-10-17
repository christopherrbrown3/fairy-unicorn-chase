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
        time: { value: 0 },
        night: { value: 0 },
        underwater: { value: 0 },
      },
      vertexShader: `varying vec3 skyDirection;
        void main() {
          skyDirection = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `varying vec3 skyDirection;
        uniform vec3 zenith, horizon, sunColor;
        uniform float sunStrength, time, night, underwater;
        float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
        float noise(vec2 p) {
          vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
          return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.0),f.x),f.y);
        }
        float billows(vec2 p) {
          return noise(p)*0.57+noise(p*2.03+7.1)*0.28+noise(p*4.07)*0.15;
        }
        void main() {
          vec3 d = normalize(skyDirection);
          float height = smoothstep(-0.05, 0.8, d.y);
          vec3 color = mix(horizon, zenith, pow(height, 0.65));
          float sun = max(dot(d, normalize(vec3(-0.6, 0.45, 0.55))), 0.0);
          color += sunColor * (pow(sun, 28.0) * 0.17 + pow(sun, 400.0) * 0.28) * sunStrength;
          vec2 cloudUv = d.xz / max(d.y + 0.22, 0.1) * 2.8 + vec2(time * 0.008, 0.0);
          float cloud = billows(cloudUv);
          float coverage = smoothstep(0.49,0.67,cloud) * smoothstep(0.02,0.22,d.y);
          vec3 cloudColor = mix(vec3(0.69,0.79,0.88),vec3(1.0,0.97,0.90),smoothstep(0.48,0.78,cloud));
          color = mix(color,cloudColor,coverage*sunStrength*0.9);
          // A restrained ribbon of aurora belongs only to the starlight world.
          float curtain = sin(d.x*5.0+d.z*4.0+time*0.06)*0.055+0.15;
          float aurora = exp(-pow((d.y-curtain)*14.0,2.0));
          color += mix(vec3(0.06,0.3,0.27),vec3(0.18,0.09,0.3),noise(d.xz*6.0)) * aurora * night;
          if (underwater > 0.5) {
            // A rippled luminous canopy replaces the daylight sky underwater.
            vec2 waterUv = d.xz / max(d.y + 0.45, 0.12) * 4.0;
            float ripple = sin(waterUv.x*3.0 + sin(waterUv.y*2.5 + time*0.16));
            float crossRipple = sin(waterUv.y*3.4 + sin(waterUv.x*2.0 - time*0.13));
            float caustic = pow(max(0.0, 1.0-abs(ripple+crossRipple)*0.6), 7.0);
            color += vec3(0.18,0.32,0.25) * caustic * smoothstep(0.0,0.7,d.y) * 0.32;
          }
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
    const dark = ["night", "crystal", "spooky"].includes(level.theme);
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
    this.material.uniforms.night.value = level.theme === "night" ? 1 : 0;
    if (level.theme === "crystal") this.material.uniforms.sunStrength.value = 0;
    const underwater = level.theme === "underwater";
    this.material.uniforms.underwater.value = underwater ? 1 : 0;
    if (underwater) {
      horizon.set(level.sky).lerp(new THREE.Color("#8cd5cc"), 0.25);
      this.material.uniforms.horizon.value.copy(horizon);
      this.material.uniforms.zenith.value.set("#73d4d8");
      this.material.uniforms.sunStrength.value = 0;
    }
    return horizon;
  }
  update(camera, time = 0) {
    this.mesh.position.copy(camera.position);
    this.material.uniforms.time.value = time;
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
        diffuseColor.rgb *= 0.82 + patches * 0.25 + grain * 0.07;
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
