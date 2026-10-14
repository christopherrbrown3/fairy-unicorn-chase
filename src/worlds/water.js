import * as THREE from "three";
import {
  group,
  mesh,
  geometry,
  orb,
  cylinder,
  bake,
  disposeTree,
} from "../art/primitives.js";
import { coursePoint } from "../config/levels.js";
import { flower } from "./props.js";

// Opaque, single-pass water: painted depth, moving ripples and a pale shoreline.
// No reflection render target or screen-space effects on tablet hardware.
export class WaterGardens {
  constructor(parent, level) {
    this.root = group(parent);
    this.root.name = "Lily ponds";
    this.time = { value: 0 };
    const dark = ["night", "crystal"].includes(level.theme);
    this.material = new THREE.MeshStandardMaterial({
      color: dark ? "#557baa" : "#66b9c4",
      roughness: 0.28,
      metalness: 0.1,
    });
    this.material.onBeforeCompile = (shader) => {
      shader.uniforms.waterTime = this.time;
      shader.vertexShader =
        `varying vec2 pondUv;\n${shader.vertexShader}`.replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\npondUv=uv*2.0-1.0;",
        );
      shader.fragmentShader =
        `varying vec2 pondUv; uniform float waterTime;\n${shader.fragmentShader}`.replace(
          "#include <color_fragment>",
          `#include <color_fragment>
        float r=length(pondUv);
        float wave=sin(pondUv.y*58.0+sin(pondUv.x*7.0+waterTime*0.3)*2.0+waterTime*1.2);
        float glint=sin(pondUv.x*17.0+sin(pondUv.y*12.0)+waterTime*0.6);
        float ripple=sin(r*72.0-waterTime*2.0);
        float shore=smoothstep(0.81,1.0,r);
        diffuseColor.rgb *= 0.8+wave*0.1+ripple*0.035;
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.66,0.89,0.81),shore*0.7);
        diffuseColor.rgb+=vec3(0.55,0.8,0.85)*smoothstep(0.94,1.0,wave)*smoothstep(0.3,0.9,glint)*0.3;
        float rim=smoothstep(0.93,0.96,r)*(1.0-smoothstep(0.96,1.0,r));
        diffuseColor.rgb+=rim*0.18;`,
        );
    };
    if (["cloud", "candy", "mountain", "minecraft"].includes(level.theme)) return;
    const surface = geometry("pond-surface", () => {
      const geo = new THREE.CircleGeometry(1, 48);
      const p = geo.attributes.position;
      for (let i = 1; i < p.count; i++) {
        const x = p.getX(i),
          y = p.getY(i),
          a = Math.atan2(y, x);
        const r = 1 + Math.sin(a * 3) * 0.07 + Math.sin(a * 5 + 1) * 0.045;
        p.setXY(i, x * r, y * r);
      }
      return geo;
    });
    const decorations = group(this.root),
      surfaces = group(this.root);
    for (let i = 0; i < 14; i++) {
      const s = 18 + (i * Math.PI * 2 * level.radius) / 14,
        side = i % 2 ? 1 : -1;
      const p = coursePoint(level, s, side * (level.width / 2 + 5.5));
      const pond = group(surfaces, [p.x, p.y - 0.085, p.z]);
      pond.rotation.y = p.yaw;
      const water = new THREE.Mesh(surface, this.material);
      water.rotation.x = -Math.PI / 2;
      water.scale.set(3.3, 4.6, 1);
      water.receiveShadow = true;
      pond.add(water);
      const detail = group(decorations, pond.position.toArray());
      detail.rotation.y = p.yaw;
      for (let j = 0; j < 3; j++) {
        const a = j * 2.3 + i,
          x = Math.cos(a) * 2.05,
          z = Math.sin(a) * 3.0;
        const pad = mesh(
          detail,
          geometry(
            "lily-pad",
            () => new THREE.CircleGeometry(0.48, 24, 0.22, Math.PI * 2 - 0.44),
          ),
          "#609e77",
          [x, 0.035, z],
        );
        pad.rotation.set(-Math.PI / 2, 0, a);
        if (j === 0) {
          const lily = flower(detail, level.accent, 0.48);
          lily.position.set(x, -0.27, z);
          lily.rotation.x = -0.75;
        }
      }
      for (let j = 0; j < 5; j++) {
        const a = j * 0.22 + 0.6,
          x = Math.cos(a) * 3.25,
          z = Math.sin(a) * 4.4;
        cylinder(
          detail,
          "#759876",
          [x, 0.35, z],
          [0.027, 0.8 + (j % 2) * 0.25, 0.027],
        );
        orb(
          detail,
          "#997858",
          [x, 0.82 + (j % 2) * 0.12, z],
          [0.075, 0.18, 0.075],
        );
      }
      for (let j = 0; j < 9; j++) {
        const a = j * 2.4;
        orb(
          detail,
          "#b5b9a2",
          [Math.cos(a) * 3.5, -0.015, Math.sin(a) * 4.8],
          [0.23, 0.13, 0.32],
        );
      }
    }
    bake(surfaces);
    bake(decorations);
  }
  update(time) {
    this.time.value = time;
  }
  dispose() {
    this.material.dispose();
    disposeTree(this.root);
  }
}
