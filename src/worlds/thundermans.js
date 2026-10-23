import * as THREE from "three";
import { group, mesh, geometry, box, cylinder, cone } from "../art/primitives.js";

// Original fan-inspired scenery: the suburban super-family and its secret lab.
// These are scenery props; the sculpted Mia/Glender/unicorn cast is untouched.
const navy = "#52648b", cream = "#fff1d3", gold = "#f3c65e";
const cool = "#79d2e5", warm = "#f2a264";
const round = (p, color, pos, scale) => mesh(p,
  geometry("thunder-round", () => new THREE.SphereGeometry(1, 16, 10)), color, pos, scale);

// Small garden forms use their own low-resolution shared meshes. They read as
// grouped plantings, not hundreds of individually expensive foreground flowers.
const foliage = (p, color, pos, scale) => mesh(p,
  geometry("thunder-foliage", () => new THREE.SphereGeometry(1, 10, 6)), color, pos, scale);
function flowerBed(parent, x, z, length = 3, variant = 0) {
  box(parent, "#b8cbd2", [x, 0.19, z], [length, 0.38, 0.9]);
  box(parent, "#806d5d", [x, 0.4, z], [length - 0.15, 0.06, 0.74]);
  for (let i = 0; i < 5; i++) {
    const px = x - length * 0.37 + i * length * 0.185;
    cylinder(parent, "#6b9b86", [px, 0.65, z], [0.035, 0.5, 0.035]);
    foliage(parent, "#6b9b86", [px + 0.12, 0.59, z], [0.22, 0.07, 0.11]).rotation.z = 0.4;
    mesh(parent, geometry("thunder-blossom", () => new THREE.SphereGeometry(1, 8, 5)),
      [warm, cream, gold][(i + variant) % 3], [px, 0.93 + (i % 2) * 0.1, z], [0.2, 0.24, 0.2]);
  }
}
function shadeTree(parent, x, z, scale = 1) {
  const g = group(parent, [x, 0, z]);
  cylinder(g, "#806d5d", [0, 2.2, 0], [0.23, 4.4, 0.23]);
  for (const side of [-1, 1]) {
    cylinder(g, "#806d5d", [side * 0.57, 3.1, 0], [0.12, 1.7, 0.12]).rotation.z = side * -0.65;
    foliage(g, "#6b9b86", [side * 1.25, 4.45, 0], [1.6, 1.65, 1.6]);
  }
  foliage(g, "#82ac89", [0, 5.6, -0.15], [1.9, 1.6, 1.8]);
  g.scale.setScalar(scale);
  return g;
}
function picketFence(parent, x, z, length) {
  for (const y of [0.43, 0.9]) box(parent, cream, [x, y, z], [length, 0.11, 0.1]);
  for (let i = 0; i <= Math.floor(length / 0.6); i++) {
    const px = x - length / 2 + i * 0.6;
    box(parent, cream, [px, 0.68, z], [0.21, 1.36, 0.14]);
    cone(parent, cream, [px, 1.42, z], [0.16, 0.2, 0.12]);
  }
}

export function neighborhoodGarden(parent, scale = 1, variant = 0) {
  const g = group(parent);
  g.name = "Layered neighborhood garden";
  shadeTree(g, variant % 2 ? 1.4 : -1.4, -1.5, 1.1);
  for (const x of [-2.3, 0, 2.3]) foliage(g, "#6b9b86", [x, 0.65, 0.4], [1.3, 0.75, 0.9]);
  flowerBed(g, 0, 1.6, 4, variant);
  picketFence(g, 0, 2.7, 5.4);
  g.scale.setScalar(scale);
  return g;
}

export function telekinesisDisplay(parent, scale = 1) {
  const g = group(parent);
  g.name = "Telekinesis floating book and ball exhibit";
  box(g, navy, [0, 0.35, 0], [3.8, 0.7, 2.1]);
  for (const [x, y, color] of [[-1.1, 1.45, warm], [0, 2.1, cool], [1, 2.8, gold]]) {
    const book = group(g, [x, y, 0]);
    book.rotation.z = x * 0.2;
    box(book, cream, [0, 0, 0], [0.8, 0.2, 1]);
    for (const dy of [-0.13, 0.13]) box(book, color, [0, dy, 0], [0.9, 0.06, 1.1]);
    box(book, color, [-0.43, 0, 0], [0.08, 0.24, 1.1]);
  }
  round(g, "#bda0db", [-1.1, 3.05, 0], [0.43, 0.43, 0.43]);
  mesh(g, geometry("twin-power-ring", () => new THREE.TorusGeometry(0.8, 0.1, 6, 20)), cool,
    [0, 1, 0], [1.8, 1, 1]).rotation.x = Math.PI / 2;
  g.scale.setScalar(scale);
  return g;
}

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

export function familyHouse(parent, scale = 1, variant = 0) {
  const g = group(parent);
  g.name = `Super-family suburban home ${variant % 3 + 1}`;
  box(g, ["#dfcba4", "#b8cbd2", "#82ac89"][variant % 3], [0, 3.2, 0], [7.6, 6.4, 5.4]);
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
  // The chase sees side walls as often as the porch: finish all elevations.
  for (const side of [-1, 1]) {
    const wall = group(g, [side * 3.82, 0, 0]);
    wall.rotation.y = side * Math.PI / 2;
    for (let i = 0; i < 10; i++) box(wall, "#eadbb9", [0, 0.4 + i * 0.6, 0], [5.4, 0.035, 0.04]);
    for (const x of [-1.3, 1.3]) window(wall, x, 4.8, 0.05);
    if (side < 0) for (const x of [-1.3, 1.3]) window(wall, x, 2, 0.05);
  }
  const back = group(g, [0, 0, -2.75]);
  back.rotation.y = Math.PI;
  for (const x of [-2.3, 2.3]) window(back, x, 4.9, 0, 1.45);
  // Three roof profiles share the same footprint; the dormer is a real volume.
  if (variant % 3 !== 1) {
    const x = variant % 3 === 2 ? -1.7 : 0;
    box(g, "#eadbb9", [x, 7.3, 1.7], [2, 1.7, 1.7]);
    const cap = mesh(g, geometry("thunder-house-roof", () => new THREE.ConeGeometry(1, 1, 4)), navy, [x, 8.4, 1.7], [1.65, 1.1, 1.5]);
    cap.rotation.y = Math.PI / 4;
    window(g, x, 7.3, 2.59, 0.9);
  }
  box(g, "#806d5d", [variant % 2 ? -2.7 : 2.7, 7.5, -1.3], [0.8, 2.6, 0.85]);
  box(g, cream, [variant % 2 ? -2.7 : 2.7, 8.84, -1.3], [1, 0.2, 1.05]);
  for (const side of [-1, 1]) {
    box(g, cream, [side * 1.2, 1.1, 4.05], [1, 0.1, 0.1]);
    for (let i = 0; i < 3; i++) box(g, cream, [side * (0.8 + i * 0.35), 0.65, 4.05], [0.07, 0.9, 0.07]);
    round(g, gold, [side * 1.1, 2.8, 3.02], [0.15, 0.25, 0.13]);
  }
  for (let i = 0; i < 3; i++) box(g, "#b8cbd2", [0, 0.07 + i * 0.06, 4.7 - i * 0.3], [1.6, 0.14, 0.4]);
  box(g, "#dfcba4", [0, 0.02, 6.1], [1.6, 0.04, 2.5]);
  flowerBed(g, -2.6, 4.3, 2.6, variant);
  flowerBed(g, 3.2, 5, 2.6, variant + 1);
  picketFence(g, -3.7, 7.3, 4.2);
  picketFence(g, 3.7, 7.3, 4.2);
  shadeTree(g, -6, -0.8, 1.15);
  for (const z of [0.5, 2.8, 5.1]) foliage(g, "#6b9b86", [-6, 0.65, z], [0.8, 0.8, 1.3]);
  // Attached garage keeps the setting suburban instead of another castle.
  box(g, "#b8cbd2", [5.3, 1.65, -0.2], [3.2, 3.3, 4.9]);
  box(g, navy, [5.3, 3.4, -0.2], [3.6, 0.3, 5.3]);
  box(g, cream, [5.3, 1.4, 2.3], [2.6, 2.6, 0.12]);
  for (let i = 0; i < 5; i++) box(g, "#b8cbd2", [5.3, 0.4 + i * 0.48, 2.39], [2.6, 0.035, 0.03]);
  for (const x of [4.5, 5.3, 6.1]) box(g, "#8ebbd1", [x, 2.3, 2.4], [0.55, 0.4, 0.04]);
  box(g, navy, [5.3, 1.1, 2.42], [0.5, 0.07, 0.06]);
  box(g, "#b8cbd2", [5.3, 0.02, 4.5], [3.2, 0.04, 4]);
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
  for (const x of [-1.15, 1.15]) {
    box(g, "#b2c4d5", [x, 0.42, 0.83], [0.8, 0.5, 0.04]);
    for (let i = 0; i < 3; i++) box(g, navy, [x, 0.27 + i * 0.13, 0.87], [0.65, 0.045, 0.03]);
  }
  box(g, cream, [0, 0.4, 0.84], [0.75, 0.5, 0.05]);
  box(g, warm, [0, 0.4, 0.88], [0.06, 0.32, 0.03]).rotation.z = -0.7;
  g.scale.setScalar(scale);
  return g;
}

export function twinPowerDisplay(parent, scale = 1) {
  const g = group(parent);
  g.name = "Heat and freeze powers shared by both twins";
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
  // Racks, meters and connected plumbing turn the pavilion into a workshop.
  for (const side of [-1, 1]) {
    const rack = group(g, [side * 2.7, 0.6, -2.35]);
    for (const x of [-0.7, 0.7]) box(rack, "#b2c4d5", [x, 1.3, 0], [0.09, 2.6, 0.6]);
    for (const y of [0.5, 1.4, 2.3]) {
      box(rack, cream, [0, y, 0], [1.6, 0.12, 0.6]);
      for (let i = 0; i < 3; i++) {
        cylinder(rack, [cool, warm, "#bda0db"][i], [-0.48 + i * 0.48, y + 0.3, 0], [0.14, 0.5, 0.14]);
        cylinder(rack, cream, [-0.48 + i * 0.48, y + 0.58, 0], [0.1, 0.1, 0.1]);
      }
    }
    box(g, "#b2c4d5", [side * 3.4, 1.3, 1.5], [0.9, 1.3, 0.7]);
    mesh(g, geometry("lab-gauge", () => new THREE.CylinderGeometry(0.28, 0.28, 0.08, 12)), cream,
      [side * 3.4, 1.5, 1.9]).rotation.x = Math.PI / 2;
    box(g, navy, [side * 3.4, 1.5, 1.96], [0.035, 0.35, 0.03]).rotation.z = side * 0.6;
    cylinder(g, side < 0 ? cool : warm, [side * 3.4, 0.85, -0.2], [0.1, 3.4, 0.1]).rotation.x = Math.PI / 2;
  }
  for (let i = 0; i < 4; i++) {
    box(g, cool, [-1.05 + i * 0.7, 3.17, -2.46], [0.4, 0.1 + i * 0.12, 0.08]);
    box(g, cream, [0, 0.12 + i * 0.12, 4 - i * 0.3], [3.2, 0.24, 0.5]);
  }
  telekinesisDisplay(g, 0.6).position.set(0.1, 0.6, 1.35);
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
