import * as THREE from "three";

// Painterly fine detail (grass strokes, pebbles, mottling, cloud shading) costs a few
// noise lookups per pixel. Gentle quality and the automatic slow-device fallback turn
// it off; a uniform branch skips the work without recompiling any shader.
export const paintDetail = { value: 1 };

// One small tileable texture replaces per-pixel hash noise on terrain and props.
// Each texel holds four octaves (4, 8, 16 and 32 cells per tile), so a single
// fetch is far cheaper than sin() hashes on tablet GPUs, and mipmaps keep the
// fine detail from shimmering in the distance.
export const paintNoise = { value: null };
function createPaintNoise(size = 128) {
  const hash = (x, y, c) => {
    const v = Math.sin(x * 127.1 + y * 311.7 + c * 74.7) * 43758.5453;
    return v - Math.floor(v);
  };
  const smooth = (t) => t * t * (3 - 2 * t);
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++)
      for (let c = 0; c < 4; c++) {
        const cells = 4 << c,
          u = (x / size) * cells,
          v = (y / size) * cells;
        const i = Math.floor(u),
          j = Math.floor(v),
          fu = smooth(u - i),
          fv = smooth(v - j);
        const at = (a, b) => hash((i + a) % cells, (j + b) % cells, c);
        const value =
          (at(0, 0) * (1 - fu) + at(1, 0) * fu) * (1 - fv) +
          (at(0, 1) * (1 - fu) + at(1, 1) * fu) * fv;
        data[(y * size + x) * 4 + c] = Math.round(value * 255);
      }
  const texture = new THREE.DataTexture(data, size, size);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}
const usePaintNoise = () => (paintNoise.value ??= createPaintNoise());

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
        paintDetail,
      },
      vertexShader: `varying vec3 skyDirection;
        void main() {
          skyDirection = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `varying vec3 skyDirection;
        uniform vec3 zenith, horizon, sunColor;
        uniform float sunStrength, time, night, underwater, paintDetail;
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
          vec3 sunDirection = normalize(vec3(-0.6, 0.45, 0.55));
          float sun = max(dot(d, sunDirection), 0.0);
          // Broad warm scattering, a halo and a soft disc around the sun.
          color += sunColor * (pow(sun, 5.0) * 0.07 + pow(sun, 28.0) * 0.17 + pow(sun, 400.0) * 0.28) * sunStrength;
          // A pale, luminous haze hugs the horizon behind the hills.
          color = mix(color, horizon + vec3(0.035, 0.03, 0.02), exp(-max(d.y, 0.0) * 18.0) * 0.45 * sunStrength);
          // Cave and sea skies have no clouds; clear patches skip the shading samples.
          if (sunStrength > 0.0 && d.y > 0.02) {
            vec2 cloudUv = d.xz / max(d.y + 0.22, 0.1) * 2.8 + vec2(time * 0.008, 0.0);
            float cloud = billows(cloudUv);
            float coverage = smoothstep(0.5,0.64,cloud) * smoothstep(0.02,0.22,d.y);
            if (coverage > 0.0) {
              // Sampling a little toward the sun shades the far side of each billow.
              float lit = 0.8;
              if (paintDetail > 0.5)
                lit = clamp(0.62 + (cloud - billows(cloudUv + normalize(sunDirection.xz) * 0.11)) * 5.0, 0.0, 1.0);
              vec3 cloudShadow = mix(zenith, vec3(0.74,0.77,0.9), 0.62);
              vec3 cloudColor = mix(cloudShadow, vec3(1.0,0.975,0.93), lit);
              // Thin edges glow when they sit near the sun.
              cloudColor += sunColor * (1.0 - smoothstep(0.5, 0.6, cloud)) * pow(sun, 6.0) * 0.35;
              color = mix(color,cloudColor,coverage*sunStrength*0.92);
            }
          }
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
// Themes add a picnic check or drifting sea caustics.
export const terrainTime = { value: 0 };
export function terrainMaterial(
  color,
  {
    road = false,
    edge = color,
    halfwidth = 1,
    verge = -1,
    warmth = 1,
    pattern = "",
    length = 1,
  } = {},
) {
  const result = new THREE.MeshStandardMaterial({ color, roughness: 0.96 });
  result.onBeforeCompile = (shader) => {
    shader.uniforms.groundEdge = { value: new THREE.Color(edge) };
    shader.uniforms.bandHalfwidth = { value: halfwidth };
    shader.uniforms.vergeEdge = { value: verge };
    shader.uniforms.terrainWarmth = { value: warmth };
    shader.uniforms.bandLength = { value: length };
    shader.uniforms.terrainTime = terrainTime;
    shader.uniforms.paintDetail = paintDetail;
    shader.uniforms.paintNoise = paintNoise;
    shader.vertexShader =
      `varying vec3 terrainPosition; varying vec2 terrainUv;\n${shader.vertexShader}`.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nterrainPosition = (modelMatrix * vec4(position, 1.0)).xyz; terrainUv = uv;",
      );
    shader.fragmentShader =
      `varying vec3 terrainPosition; varying vec2 terrainUv;
      uniform vec3 groundEdge; uniform float bandHalfwidth, bandLength, vergeEdge, terrainWarmth, terrainTime, paintDetail;
      uniform sampler2D paintNoise;
      float terrainHash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }\n${shader.fragmentShader}`.replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        vec2 ground = terrainPosition.xz;
        // Broad octaves: 18, 9, 4.5 and 2.25 world units per cell.
        vec4 broad = texture2D(paintNoise, ground / 72.0);
        float near = 1.0 - smoothstep(14.0, 34.0, length(vViewPosition));
        float across = abs(terrainUv.x * 2.0 - 1.0);
        ${road ? roadPaint(pattern) : groundPaint}
        ${pattern === "caustics" ? causticPaint : ""}
      `,
      );
  };
  result.customProgramCacheKey = () => `terrain-${road}-${pattern}`;
  usePaintNoise();
  return result;
}

// Meadow ground: warm sunlit and cool shaded drifts, clumps and brushed strokes.
const groundPaint = `
        float drift = broad.r * 0.6 + broad.g * 0.4;
        vec3 warm = diffuseColor.rgb * mix(vec3(1.0), vec3(1.07, 1.06, 0.86), terrainWarmth);
        vec3 cool = diffuseColor.rgb * mix(vec3(1.0), vec3(0.86, 0.95, 1.03), terrainWarmth);
        diffuseColor.rgb = mix(cool, warm, smoothstep(0.28, 0.72, drift));
        float fine = 0.04;
        if (paintDetail > 0.5) {
          // Stretched, rotated coordinates read as brushed grass strokes.
          vec4 strokes = texture2D(paintNoise, vec2(ground.x * 1.3 + ground.y * 0.55, ground.y * 0.25 - ground.x * 0.17) / 12.0);
          fine = strokes.b * 0.1 + strokes.a * 0.05;
        }
        diffuseColor.rgb *= 0.92 + broad.a * 0.1 + fine;
        // A soft shade where the grass meets the path gives the edge some depth.
        if (vergeEdge > 0.0) {
          float lateral = across * bandHalfwidth;
          diffuseColor.rgb *= 1.0 - (1.0 - smoothstep(vergeEdge, vergeEdge + 1.8, lateral)) * 0.1;
        }`;

// Paths: a worn centre, pebble flecks, an irregular painted edge and a soil lip.
function roadPaint(pattern) {
  return `
        // Path octaves: 1.5, 0.75, 0.38 and 0.19 world units per cell.
        vec4 path = texture2D(paintNoise, ground / 6.0);
        float patches = path.r;
        float edge = across + (path.g - 0.5) * 0.09;
        diffuseColor.rgb *= 0.88 + patches * 0.18;
        ${pattern === "gingham" ? ginghamPaint : ""}
        if (paintDetail > 0.5) {
          diffuseColor.rgb *= 1.0 + (1.0 - smoothstep(0.0, 0.6, across)) * 0.06 * broad.b;
          edge += (path.a - 0.5) * 0.035;
          diffuseColor.rgb *= 1.0 + (texture2D(paintNoise, ground / 2.5).a - 0.5) * 0.06;
          if (near > 0.0) {
            vec2 pebbleCell = floor(ground * 2.6);
            vec2 pebbleOffset = vec2(terrainHash(pebbleCell + 1.7), terrainHash(pebbleCell + 9.2)) * 0.5 + 0.25;
            float pebbleKind = terrainHash(pebbleCell);
            float pebble = (1.0 - smoothstep(0.05, 0.1, length(fract(ground * 2.6) - pebbleOffset)))
              * step(0.74, pebbleKind) * near;
            diffuseColor.rgb *= 1.0 + pebble * (pebbleKind > 0.87 ? 0.12 : -0.16);
          }
        }
        float lip = smoothstep(0.84, 0.92, edge) * (1.0 - smoothstep(0.94, 0.99, edge));
        diffuseColor.rgb *= 1.0 - lip * 0.09;
        diffuseColor.rgb = mix(diffuseColor.rgb, groundEdge * (0.9 + patches * 0.1), smoothstep(0.93, 0.99, edge));`;
}

// Pancake Picnic's runner: a soft woven gingham check that follows the path.
const ginghamPaint = `
        vec2 weave = vec2(terrainUv.x * bandHalfwidth * 2.0, terrainUv.y * bandLength) / 1.3;
        float rows = step(0.5, fract(weave.x)), columns = step(0.5, fract(weave.y));
        diffuseColor.rgb *= mix(1.08, 0.86, (rows + columns) * 0.5);`;

// Coral Lagoon: rippling bands of light drift across the sand and seabed.
const causticPaint = `
        vec2 sea = ground * 0.42;
        float waveA = sin(sea.x * 2.3 + sin(sea.y * 1.9 + terrainTime * 0.5) * 1.6 + terrainTime * 0.35);
        float waveB = sin(sea.y * 2.6 + sin(sea.x * 1.7 - terrainTime * 0.4) * 1.6);
        float caustic = pow(max(0.0, 1.0 - abs(waveA + waveB) * 0.55), 5.0);
        diffuseColor.rgb += vec3(0.2, 0.3, 0.26) * caustic * (0.35 + near * 0.4);`;

// Every scenery material shares this program: props darken softly where they
// meet the ground and gain a sky-tinted rim that lifts them off the background.
export const storybook = {
  groundWave: { value: 0.35 },
  occlusion: { value: 0.6 },
  rimColor: { value: new THREE.Color("#fff1d9") },
  rimStrength: { value: 0.2 },
};
export function setStorybookLevel(level, horizon, wave) {
  const dark = ["night", "crystal", "spooky"].includes(level.theme);
  storybook.groundWave.value = wave;
  storybook.occlusion.value = level.theme === "cloud" ? 0.8 : 0.6;
  storybook.rimColor.value
    .copy(horizon)
    .lerp(new THREE.Color(dark ? "#c9b8ff" : "#fff8ec"), 0.5);
  storybook.rimStrength.value = dark ? 0.3 : 0.2;
}
export function storybookShading(material) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.storyGroundWave = storybook.groundWave;
    shader.uniforms.storyOcclusion = storybook.occlusion;
    shader.uniforms.storyRimColor = storybook.rimColor;
    shader.uniforms.storyRimStrength = storybook.rimStrength;
    shader.uniforms.paintDetail = paintDetail;
    shader.uniforms.paintNoise = paintNoise;
    shader.vertexShader = `varying vec3 storyWorld;\n${shader.vertexShader}`.replace(
      "#include <project_vertex>",
      `#include <project_vertex>
      vec4 storyPosition = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        storyPosition = instanceMatrix * storyPosition;
      #endif
      storyWorld = (modelMatrix * storyPosition).xyz;`,
    );
    shader.fragmentShader = `varying vec3 storyWorld;
      uniform float storyGroundWave, storyOcclusion, storyRimStrength, paintDetail;
      uniform vec3 storyRimColor;
      uniform sampler2D paintNoise;\n${shader.fragmentShader}`
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        // Soft painterly mottling keeps broad hills, walls and cloud banks from looking flat.
        if (paintDetail > 0.5) {
          vec4 storyPaint = texture2D(paintNoise, (storyWorld.xz + storyWorld.y * vec2(1.3, -0.8)) / 19.0);
          diffuseColor.rgb *= 0.95 + storyPaint.g * 0.07 + storyPaint.a * 0.03;
        }`,
      )
      .replace(
        "#include <aomap_fragment>",
        `#include <aomap_fragment>
        float storyLift = storyWorld.y - storyGroundWave * sin(4.0 * atan(storyWorld.x, -storyWorld.z));
        float storyUp = max(inverseTransformDirection(normal, viewMatrix).y, 0.0);
        float storyAo = mix(storyOcclusion, 1.0, smoothstep(-0.05, 1.6, storyLift));
        storyAo = mix(storyAo, 1.0, storyUp * 0.65);
        reflectedLight.indirectDiffuse *= storyAo;
        reflectedLight.indirectSpecular *= storyAo;
        reflectedLight.directDiffuse *= mix(1.0, storyAo, 0.45);`,
      )
      .replace(
        "#include <opaque_fragment>",
        `float storyFacing = 1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);
        outgoingLight += storyRimColor * pow(storyFacing, 3.0) * storyRimStrength * storyAo;
        #include <opaque_fragment>`,
      );
  };
  material.customProgramCacheKey = () => "storybook";
  usePaintNoise();
  return material;
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
