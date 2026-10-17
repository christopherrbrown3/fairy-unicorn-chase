import * as THREE from "three";
import { group, mesh, geometry, box, cylinder } from "../art/primitives.js";

const crust = "#ba7d48", pancake = "#e9bc77", butter = "#ffe17d";
const syrup = "#a9663c", cream = "#fff1cf", berry = "#df7386";
const round = (p, color, pos, scale) => mesh(p,
  geometry("breakfast-round", () => new THREE.SphereGeometry(1, 12, 8)), color, pos, scale);

export function pancakeStack(parent, scale = 1) {
  const g = group(parent);
  g.name = "Butter and maple syrup pancakes";
  cylinder(g, "#e0eee5", [0, 0.16, 0], [2.3, 0.3, 2.3]);
  for (let i = 0; i < 4; i++) {
    const y = 0.53 + i * 0.5;
    cylinder(g, crust, [0, y, 0], [1.85, 0.42, 1.85]);
    cylinder(g, pancake, [0, y + 0.19, 0], [1.79, 0.16, 1.79]);
  }
  round(g, syrup, [0, 2.27, 0], [1.63, 0.1, 1.52]);
  for (const [x, z, h] of [[1.77, 0.2, 0.75], [-0.6, 1.7, 1.2], [-1.72, -0.4, 0.45]])
    round(g, syrup, [x, 2.22 - h / 2, z], [0.19, h / 2, 0.19]);
  const pat = box(g, butter, [0.1, 2.49, 0], [0.85, 0.34, 0.75]);
  pat.rotation.y = 0.25;
  for (const [x, z] of [[0.9, 0.6], [0.65, 0.95], [1.1, 0.95]])
    round(g, "#797faf", [x, 2.42, z], [0.2, 0.2, 0.2]);
  g.scale.setScalar(scale);
  return g;
}

export function waffle(parent, scale = 1) {
  const g = group(parent);
  g.name = "Golden breakfast waffle";
  box(g, crust, [0, 1.65, 0], [3.2, 3.2, 0.5]);
  // Deep toasted squares sit behind raised golden grid lines on both faces.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const p = -1.5 + i * 0.75;
      box(g, pancake, [p, 1.65, side * 0.3], [0.16, 3.15, 0.15]);
      box(g, pancake, [0, p + 1.65, side * 0.3], [3.15, 0.16, 0.15]);
    }
  }
  box(g, butter, [0.45, 2.9, 0.45], [0.65, 0.65, 0.22]).rotation.z = 0.25;
  g.rotation.z = -0.12;
  g.scale.setScalar(scale);
  return g;
}

export function strawberry(parent, scale = 1) {
  const g = group(parent);
  g.name = "Giant breakfast strawberry";
  round(g, berry, [0, 1.2, 0], [1.05, 1.35, 0.95]);
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI * 2 / 6, y = i < 6 ? 1.1 : 1.8;
    round(g, butter, [Math.sin(a) * (i < 6 ? 1.01 : 0.86), y, Math.cos(a) * (i < 6 ? 0.92 : 0.78)], [0.055, 0.11, 0.055]);
  }
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5;
    const leaf = round(g, "#6ca784", [Math.sin(a) * 0.4, 2.43, Math.cos(a) * 0.4], [0.24, 0.08, 0.65]);
    leaf.rotation.y = a;
  }
  cylinder(g, "#6ca784", [0, 2.65, 0], [0.09, 0.45, 0.09]);
  g.scale.setScalar(scale);
  return g;
}

export function sunnyEgg(parent, scale = 1) {
  const g = group(parent);
  g.name = "Sunny-side-up egg";
  round(g, "#fff8e6", [0, 0.26, 0], [1.65, 0.24, 1.3]);
  round(g, "#fff8e6", [0.7, 0.2, 0.4], [1.2, 0.2, 0.9]);
  round(g, "#f4c35f", [-0.15, 0.55, 0], [0.65, 0.45, 0.65]);
  round(g, "#ffe7a1", [-0.35, 0.78, 0.22], [0.17, 0.08, 0.17]);
  g.scale.setScalar(scale);
  return g;
}

export function orangeWedge(parent, scale = 1) {
  const g = group(parent);
  g.name = "Juicy orange half";
  const slice = geometry("orange-half", () => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 1.6, 0, Math.PI, false);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: false, curveSegments: 12 });
    geo.setIndex(Array.from({ length: geo.attributes.position.count }, (_, i) => i));
    return geo;
  });
  mesh(g, slice, "#efad5b", [0, 0.05, -0.25]);
  for (const side of [-1, 1]) {
    const face = mesh(g, geometry("orange-flesh", () => new THREE.CircleGeometry(1.42, 18, 0, Math.PI)), "#ffd084", [0, 0.05, side * 0.26]);
    face.rotation.y = side < 0 ? Math.PI : 0;
    for (let i = 0; i <= 6; i++) {
      const a = i * Math.PI / 6;
      const divider = box(g, cream, [Math.cos(a) * 0.69, 0.05 + Math.sin(a) * 0.69, side * 0.28], [1.4, 0.045, 0.035]);
      divider.rotation.z = a;
    }
  }
  // The cut edge rests on the ground; the semicircular rind faces upward.
  g.scale.setScalar(scale);
  return g;
}

export function toastCottage(parent, scale = 1) {
  const g = group(parent);
  g.name = "Jam toast cottage";
  const bread = geometry("toast-slice", () => {
    const s = new THREE.Shape();
    s.moveTo(-1.55, 0); s.lineTo(1.55, 0); s.lineTo(1.55, 2.4);
    s.bezierCurveTo(2.25, 2.65, 2.15, 3.75, 1.2, 3.9);
    s.quadraticCurveTo(0, 4.3, -1.2, 3.9);
    s.bezierCurveTo(-2.15, 3.75, -2.25, 2.65, -1.55, 2.4);
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.65, bevelEnabled: false });
    geo.setIndex(Array.from({ length: geo.attributes.position.count }, (_, i) => i));
    return geo;
  });
  mesh(g, bread, crust, [0, 0, -0.3]);
  mesh(g, bread, pancake, [0, 0.13, -0.35], [0.9, 0.93, 1.14]);
  box(g, berry, [0, 1, 0.44], [0.85, 1.75, 0.1]);
  for (const x of [-0.95, 0.95]) {
    round(g, "#93bdc5", [x, 2.1, 0.46], [0.37, 0.45, 0.07]);
    box(g, cream, [x, 2.1, 0.54], [0.04, 0.85, 0.03]);
  }
  round(g, berry, [0, 3.25, 0.48], [0.8, 0.35, 0.08]);
  box(g, butter, [0.25, 3.32, 0.58], [0.55, 0.4, 0.12]).rotation.z = 0.25;
  g.scale.setScalar(scale);
  return g;
}

export function breakfastGate(parent) {
  const g = group(parent);
  g.name = "Fork and spoon breakfast gateway";
  const silver = "#c3d8d7";
  box(g, silver, [-8, 3.25, 0], [0.48, 6.5, 0.35]);
  box(g, silver, [-8, 6.7, 0], [2.25, 1.1, 0.4]);
  for (let i = 0; i < 4; i++) box(g, silver, [-8.9 + i * 0.6, 7.9, 0], [0.36, 1.7, 0.35]);
  box(g, silver, [8, 3.25, 0], [0.48, 6.5, 0.35]);
  round(g, silver, [8, 7.4, 0], [1.15, 1.65, 0.35]);
  round(g, "#e3efea", [8, 7.5, 0.28], [0.85, 1.25, 0.1]);
  box(g, pancake, [0, 9.3, 0], [18, 0.55, 0.55]);
  pancakeStack(g, 0.9).position.set(0, 9.5, 0);
  for (const side of [-1, 1]) strawberry(g, 0.9).position.set(side * 9.6, 0, 0);
  return g;
}
