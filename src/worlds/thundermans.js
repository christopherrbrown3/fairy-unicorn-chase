import * as THREE from "three";
import { group, mesh, geometry, box, cylinder, cone } from "../art/primitives.js";

// Original fan-inspired scenery: the suburban super-family and its secret lab.
// These are scenery props; the sculpted Mia/Glender/unicorn cast is untouched.
const navy = "#52648b", cream = "#fff1d3", gold = "#f3c65e";
const cool = "#79d2e5", warm = "#f2a264";
const round = (p, color, pos, scale) => mesh(p,
  geometry("thunder-round", () => new THREE.SphereGeometry(1, 16, 10)), color, pos, scale);

function bolt(parent, color, position, scale = 1) {
  const geo = geometry("thunder-bolt", () => {
    const shape = new THREE.Shape();
    [[0.12, 1], [-0.72, -0.05], [-0.12, -0.05], [-0.35, -1], [0.76, 0.27], [0.12, 0.27]].forEach(([x, y], i) =>
      i ? shape.lineTo(x, y) : shape.moveTo(x, y));
    shape.closePath();
    const result = new THREE.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: false });
    result.setIndex(Array.from({ length: result.attributes.position.count }, (_, i) => i));
    return result;
  });
  return mesh(parent, geo, color, position, [scale, scale, scale]);
}

function window(parent, x, y, z, width = 1.15) {
  box(parent, cream, [x, y, z], [width + 0.2, 1.65, 0.15]);
  box(parent, "#8ebbd1", [x, y, z + 0.09], [width, 1.43, 0.06]);
  box(parent, cream, [x, y, z + 0.14], [0.07, 1.45, 0.05]);
  box(parent, cream, [x, y, z + 0.14], [width, 0.07, 0.05]);
}

export function familyHouse(parent, scale = 1) {
  const g = group(parent);
  g.name = "Super-family suburban home";
  box(g, "#dfcba4", [0, 3.2, 0], [7.6, 6.4, 5.4]);
  // Siding, paired upstairs windows and a broad front porch give a family-home silhouette.
  for (let i = 0; i < 10; i++) box(g, "#eadbb9", [0, 0.4 + i * 0.6, 2.73], [7.6, 0.035, 0.04]);
  const roof = mesh(g, geometry("thunder-house-roof", () => new THREE.ConeGeometry(1, 1, 4)), navy,
    [0, 7.5, 0], [6.1, 2.5, 4.6]);
  roof.rotation.y = Math.PI / 4;
  box(g, "#eadbb9", [0, 6.4, 0], [8.2, 0.25, 6]);
  for (const x of [-2.3, 2.3]) {
    window(g, x, 4.9, 2.8, 1.45);
    window(g, x, 2, 2.8, 1.45);
    for (const dx of [-1, 1]) box(g, "#82a8b7", [x + dx * 1, 4.9, 2.82], [0.25, 1.7, 0.12]);
  }
  box(g, navy, [0, 1.35, 2.87], [1.3, 2.7, 0.14]);
  round(g, gold, [0.42, 1.25, 3], [0.07, 0.07, 0.07]);
  box(g, cream, [0, 0.15, 3.4], [4.1, 0.3, 1.6]);
  box(g, navy, [0, 3.35, 3.25], [4.5, 0.23, 1.8]);
  for (const x of [-1.8, 1.8]) cylinder(g, cream, [x, 1.8, 3.65], [0.12, 3.1, 0.12]);
  bolt(g, gold, [0, 4.4, 2.98], 0.55);
  // Attached garage keeps the setting suburban instead of another castle.
  box(g, "#b8cbd2", [5.3, 1.65, -0.2], [3.2, 3.3, 4.9]);
  box(g, navy, [5.3, 3.4, -0.2], [3.6, 0.3, 5.3]);
  box(g, cream, [5.3, 1.4, 2.3], [2.6, 2.6, 0.12]);
  for (let i = 0; i < 5; i++) box(g, "#b8cbd2", [5.3, 0.4 + i * 0.48, 2.39], [2.6, 0.035, 0.03]);
  g.scale.setScalar(scale);
  return g;
}

export function rabbitDisplay(parent, scale = 1) {
  const g = group(parent);
  g.name = "Dr. Colosso-inspired rabbit display";
  cylinder(g, navy, [0, 0.25, 0], [1.25, 0.5, 1.25]);
  round(g, "#a8b0bd", [0, 1.12, 0], [0.66, 0.85, 0.6]);
  round(g, "#b8bfca", [0, 2.05, 0.15], [0.62, 0.6, 0.54]);
  for (const side of [-1, 1]) {
    const ear = group(g, [side * 0.29, 2.5, 0.03]);
    ear.rotation.z = side * -0.1;
    round(ear, "#a8b0bd", [0, 0.63, 0], [0.2, 0.82, 0.16]);
    round(ear, "#e2b9be", [0, 0.65, 0.14], [0.11, 0.58, 0.035]);
    round(g, "#303f58", [side * 0.25, 2.18, 0.62], [0.095, 0.13, 0.055]);
    round(g, cream, [side * 0.18, 1.87, 0.62], [0.23, 0.18, 0.14]);
    round(g, "#b8bfca", [side * 0.42, 0.6, 0.42], [0.3, 0.2, 0.45]);
    round(g, "#a8b0bd", [side * 0.55, 1.2, 0.2], [0.18, 0.4, 0.22]);
    box(g, cream, [side * 0.065, 1.7, 0.74], [0.1, 0.16, 0.045]);
  }
  round(g, "#d58e9f", [0, 1.98, 0.77], [0.12, 0.08, 0.07]);
  round(g, cream, [0.55, 0.9, -0.42], [0.27, 0.28, 0.27]);
  g.scale.setScalar(scale);
  return g;
}

export function gadgetBench(parent, scale = 1) {
  const g = group(parent);
  g.name = "Secret lab gadget and potion bench";
  box(g, navy, [0, 0.65, 0], [3.6, 1.3, 1.6]);
  box(g, "#b2c4d5", [0, 1.35, 0], [3.9, 0.2, 1.9]);
  for (const [x, color] of [[-1.1, cool], [0, warm], [1.1, "#bda0db"]]) {
    cylinder(g, color, [x, 1.9, 0], [0.24, 0.8, 0.24]);
    round(g, color, [x, 1.65, 0], [0.42, 0.34, 0.42]);
    cylinder(g, cream, [x, 2.33, 0], [0.29, 0.1, 0.29]);
    box(g, cream, [x - 0.1, 1.95, 0.24], [0.05, 0.4, 0.025]);
  }
  for (let i = 0; i < 5; i++) round(g, i % 2 ? warm : cool, [-1.2 + i * 0.6, 0.9, 0.82], [0.11, 0.11, 0.06]);
  g.scale.setScalar(scale);
  return g;
}

export function twinPowerDisplay(parent, scale = 1) {
  const g = group(parent);
  g.name = "Warm and cool twin-power exhibit";
  for (const side of [-1, 1]) {
    const color = side < 0 ? cool : warm;
    cylinder(g, navy, [side * 1.1, 0.35, 0], [0.8, 0.7, 0.8]);
    mesh(g, geometry("twin-power-ring", () => new THREE.TorusGeometry(0.8, 0.1, 6, 20)), color, [side * 1.1, 1.9, 0]);
    if (side < 0) {
      for (let i = 0; i < 3; i++) cone(g, cool, [side * 1.1 + (i - 1) * 0.28, 1.6, 0], [0.25, 1.5 - Math.abs(i - 1) * 0.4, 0.25]);
    } else {
      round(g, warm, [side * 1.1, 1.65, 0], [0.48, 0.62, 0.4]);
      round(g, gold, [side * 1.1, 1.7, 0.25], [0.26, 0.42, 0.2]);
    }
  }
  g.scale.setScalar(scale);
  return g;
}

export function heroMailbox(parent, scale = 1) {
  const g = group(parent);
  g.name = "Super-family mailbox";
  cylinder(g, cream, [0, 0.9, 0], [0.12, 1.8, 0.12]);
  box(g, navy, [0, 2, 0], [0.85, 0.65, 1.2]);
  round(g, navy, [0, 2.32, 0], [0.43, 0.35, 0.6]);
  bolt(g, gold, [0, 2.05, 0.62], 0.23);
  box(g, warm, [0.47, 2.4, 0], [0.06, 0.6, 0.4]);
  g.scale.setScalar(scale);
  return g;
}

export function secretLab(parent, scale = 1) {
  const g = group(parent);
  g.name = "Open secret basement laboratory";
  box(g, "#8d9eb8", [0, 0.3, 0], [9, 0.6, 6]);
  box(g, navy, [0, 3.1, -2.8], [9, 5.6, 0.3]);
  for (const side of [-1, 1]) {
    box(g, navy, [side * 4.35, 1.7, 0], [0.3, 2.8, 5.6]);
    cylinder(g, "#b2c4d5", [side * 3.4, 2.8, -1.9], [0.2, 4.7, 0.2]);
    for (let i = 0; i < 5; i++) mesh(g,
      geometry("lab-coil", () => new THREE.TorusGeometry(0.43, 0.09, 6, 12)), side < 0 ? cool : warm,
      [side * 3.4, 3 + i * 0.38, -1.9]).rotation.x = Math.PI / 2;
    round(g, side < 0 ? cool : warm, [side * 3.4, 5.3, -1.9], [0.55, 0.55, 0.55]);
  }
  box(g, cream, [0, 4.05, -2.58], [3.4, 1.5, 0.1]);
  box(g, "#86b7c4", [0, 4.05, -2.5], [3.1, 1.23, 0.05]);
  for (const side of [-1, 1]) bolt(g, side < 0 ? cool : warm, [side * 0.8, 4.05, -2.43], 0.42);
  gadgetBench(g, 1.15).position.set(-1.85, 0.6, -0.35);
  rabbitDisplay(g, 0.85).position.set(2.05, 0.6, 0.35);
  g.scale.setScalar(scale);
  return g;
}

export function thunderPylons(parent, scale = 1) {
  const g = group(parent);
  g.name = "Twin lightning welcome pylons";
  for (const side of [-1, 1]) {
    const color = side < 0 ? cool : warm;
    cylinder(g, navy, [side * 8, 2.15, 0], [0.65, 4.3, 0.65]);
    cylinder(g, color, [side * 8, 3.9, 0], [0.7, 0.3, 0.7]);
    round(g, navy, [side * 8, 5.8, 0], [1.7, 1.7, 0.4]);
    bolt(g, color, [side * 8, 5.8, 0.42], 1.25);
  }
  g.scale.setScalar(scale);
  return g;
}
