import * as THREE from "three";
import {
  cone,
  cylinder,
  box,
  group,
  star,
  mesh,
  geometry,
  bake,
} from "../art/primitives.js";
// Scenery uses fewer rings than close-up characters and is baked into spatial chunks.
const orb = (p, c, pos, scale = [1, 1, 1], extra = {}) =>
  mesh(
    p,
    geometry("scenery-orb", () => new THREE.SphereGeometry(1, 12, 8)),
    c,
    pos,
    scale,
    extra,
  );
export function tree(parent, color = "#70af88", scale = 1) {
  const g = group(parent);
  cylinder(g, "#b89679", [0, 1.5, 0], [0.24, 3, 0.24]);
  for (const [x, y, z, r] of [
    [0, 3, 0, 1.45],
    [-0.75, 2.65, 0.15, 1],
    [0.8, 2.8, 0.2, 1.05],
    [0.1, 3.9, 0, 0.85],
  ])
    orb(g, color, [x, y, z], [r, r * 0.92, r]);
  g.scale.setScalar(scale);
  return g;
}
export function mushroom(parent, color = "#e993ad", scale = 1) {
  const g = group(parent);
  cylinder(g, "#fff1d7", [0, 0.55, 0], [0.22, 1.1, 0.22]);
  orb(g, color, [0, 1.2, 0], [0.8, 0.4, 0.8]);
  for (const [x, z] of [
    [0, 0],
    [0.4, 0.25],
    [-0.3, 0.2],
  ])
    orb(g, "#fff6e9", [x, 1.5, z], [0.13, 0.04, 0.13]);
  g.scale.setScalar(scale);
  return g;
}
export function flower(parent, color = "#f4a7bd", scale = 1) {
  const g = group(parent);
  cylinder(g, "#639779", [0, 0.42, 0], [0.035, 0.85, 0.035]);
  orb(g, "#73b687", [0.15, 0.26, 0], [0.2, 0.065, 0.09]);
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    const petal = orb(
      g,
      color,
      [Math.cos(a) * 0.19, 0.93 + Math.sin(a) * 0.19, 0],
      [0.19, 0.13, 0.07],
    );
    petal.rotation.z = a;
  }
  orb(g, "#ffdb77", [0, 0.93, 0.05], [0.1, 0.1, 0.07]);
  g.scale.setScalar(scale);
  return g;
}
export function cloud(parent, scale = 1) {
  const g = group(parent);
  for (const [x, y, z, r] of [
    [0, 0, 0, 1.8],
    [-1.5, -0.15, 0, 1.2],
    [1.5, -0.2, 0.3, 1.3],
    [0.4, 0.65, 0, 1.25],
  ])
    orb(g, "#f5faff", [x, y, z], [r, r * 0.62, r * 0.9]);
  g.scale.setScalar(scale);
  return g;
}
export function crystal(parent, color = "#9cabea", scale = 1) {
  const g = group(parent);
  for (let i = 0; i < 3; i++) {
    const c = cone(
      g,
      color,
      [(i - 1) * 0.45, 1.2 - i * 0.15, 0],
      [0.42, 2.5 - i * 0.3, 0.42],
      {
        emissive: color,
        emissiveIntensity: 0.12,
        roughness: 0.32,
        metalness: 0.1,
      },
    );
    c.rotation.z = (i - 1) * -0.17;
  }
  g.scale.setScalar(scale);
  return g;
}
export function castle(parent, color = "#bea9d5", scale = 1, palace = false) {
  const g = group(parent);
  box(g, palace ? "#fff0de" : "#eddee1", [0, 2, 0], [5, 4, 2.8]);
  for (const x of [-2.7, 2.7]) {
    cylinder(g, "#f0e3e7", [x, 2.4, 0], [0.8, 4.8, 0.8]);
    cone(g, palace ? "#edc67b" : color, [x, 5.7, 0], [1, 2, 1]);
    cylinder(g, "#e7c06f", [x, 7.05, 0], [0.04, 1, 0.04]);
    const flag = box(g, "#e78fae", [x + 0.35, 7.4, 0], [0.65, 0.38, 0.04]);
    flag.rotation.z = -0.12;
    for (const y of [1.5, 3])
      box(g, "#779bc2", [x, y, 0.79], [0.4, 0.7, 0.035]);
  }
  box(g, "#92a8c9", [0, 1, 1.42], [1.35, 2, 0.04]);
  orb(g, color, [0, 2, 1.43], [0.68, 0.7, 0.05]);
  if (palace) {
    cylinder(g, "#fff3dc", [0, 4, 0], [1.3, 2, 1.3]);
    orb(g, "#e7c378", [0, 5.5, 0], [1.5, 1.5, 1.5]);
    star(g, "#fff1a4", [0, 7.3, 0], 0.4);
  }
  g.scale.setScalar(scale);
  return g;
}
export function rainbow(parent, scale = 1) {
  const g = group(parent);
  ["#f09da9", "#ffc98b", "#ffe3a0", "#98d5b4", "#90cbe5", "#b4a2d8"].forEach(
    (c, i) => {
      mesh(
        g,
        geometry(
          `rainbow${i}`,
          () => new THREE.TorusGeometry(9 - i * 0.46, 0.25, 6, 48, Math.PI),
        ),
        c,
      );
    },
  );
  g.scale.setScalar(scale);
  cloud(g, 0.75).position.set(-8, -0.2, 0);
  cloud(g, 0.75).position.set(8, -0.2, 0);
  return g;
}
export function candy(parent, color, scale = 1) {
  const g = group(parent);
  cylinder(g, "#ffefdf", [0, 1.6, 0], [0.12, 3.2, 0.12]);
  orb(g, color, [0, 3.3, 0], [1.1, 1.1, 0.22]);
  mesh(
    g,
    geometry("candy-ring", () => new THREE.TorusGeometry(0.64, 0.15, 7, 20)),
    "#fff3e4",
    [0, 3.3, 0.2],
  );
  g.scale.setScalar(scale);
  return g;
}
export function potion() {
  const g = group();
  g.name = "Sparkly potion";
  orb(g, "#8be3e2", [0, 0.58, 0], [0.33, 0.43, 0.33], {
    metalness: 0.15,
    roughness: 0.22,
  });
  orb(g, "#62c8d5", [0, 0.48, 0], [0.28, 0.28, 0.28], {
    emissive: "#50aabb",
    emissiveIntensity: 0.22,
  });
  cylinder(g, "#a8eee4", [0, 0.96, 0], [0.14, 0.24, 0.14]);
  cylinder(g, "#dcb47e", [0, 1.12, 0], [0.135, 0.12, 0.135]);
  cylinder(g, "#efca78", [0, 0.89, 0], [0.18, 0.09, 0.18]);
  star(g, "#fff3b0", [0, 0.61, 0.329], 0.13);
  for (let i = 0; i < 3; i++)
    star(
      g,
      "#fff6c1",
      [Math.sin(i * 2) * 0.55, 0.9 + i * 0.25, Math.cos(i * 2) * 0.25],
      0.07,
    );
  bake(g);
  return g;
}
export function obstacle(parent, kind) {
  const g = group(parent);
  if (kind === "puddle") {
    orb(g, "#6fbcd6", [0, 0.03, 0], [1.5, 0.035, 1]);
    mesh(
      g,
      geometry("ripple", () => new THREE.TorusGeometry(0.75, 0.025, 5, 24)),
      "#c8f2fa",
      [0, 0.07, 0],
    ).rotation.x = -Math.PI / 2;
  } else if (kind === "log") {
    const l = cylinder(g, "#c39d7c", [0, 0.28, 0], [0.27, 2.2, 0.27]);
    l.rotation.z = Math.PI / 2;
    for (const x of [-1.1, 1.1]) {
      const end = cylinder(g, "#e8cbb0", [x, 0.28, 0], [0.22, 0.03, 0.22]);
      end.rotation.z = Math.PI / 2;
    }
  } else if (kind === "crystal") crystal(g, "#b0a0ed", 0.8);
  else tree(g, "#82b58c", 0.65);
  return g;
}
