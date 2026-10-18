import * as THREE from "three";
import { group, mesh, geometry, box, cylinder } from "../art/primitives.js";

const glass = "#7faebc", stone = "#d8d2c4", metal = "#597681";
const round = (p, color, pos, scale) => mesh(p,
  geometry("city-round", () => new THREE.SphereGeometry(1, 12, 8)), color, pos, scale);

function windows(parent, width, height, depth, rows, columns) {
  for (let face = 0; face < 4; face++) {
    const wall = group(parent);
    wall.rotation.y = face * Math.PI / 2;
    const span = face % 2 ? depth : width, z = (face % 2 ? width : depth) / 2 + 0.025;
    for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
      box(wall, (row + col + face) % 7 === 0 ? "#f6dea0" : glass,
        [(col - (columns - 1) / 2) * span / (columns + 0.5), 2.5 + row * (height - 3.4) / rows, z],
        [span / (columns + 0.5) * 0.57, (height - 3.4) / rows * 0.65, 0.06]);
    }
  }
}

export function officeTower(parent, scale = 1) {
  const g = group(parent);
  g.name = "Downtown office tower";
  box(g, "#b8c5cc", [0, 9, 0], [6, 18, 5]);
  windows(g, 6, 18, 5, 8, 3);
  box(g, stone, [0, 0.35, 0], [6.5, 0.7, 5.5]);
  box(g, stone, [0, 18.1, 0], [6.4, 0.4, 5.4]);
  box(g, "#8ca8b7", [0, 19.4, 0], [4.6, 2.4, 3.8]);
  box(g, glass, [0, 1.25, 2.6], [1.5, 2.5, 0.08]);
  box(g, stone, [0, 1.25, 2.67], [0.08, 2.5, 0.06]);
  g.scale.setScalar(scale);
  return g;
}

export function skylineTower(parent, scale = 1) {
  const g = group(parent);
  g.name = "Stepped skyline skyscraper";
  box(g, "#91a8bb", [0, 17, 0], [9, 34, 8]);
  windows(g, 9, 34, 8, 11, 4);
  for (let i = 0; i < 3; i++) {
    const y = 35.5 + i * 3.2;
    box(g, i % 2 ? "#b7c9d2" : "#91a8bb", [0, y, 0], [7 - i * 1.6, 3.3, 6 - i * 1.4]);
  }
  cylinder(g, metal, [0, 46.5, 0], [0.17, 5, 0.17]);
  g.scale.setScalar(scale);
  return g;
}

export function storefront(parent, scale = 1) {
  const g = group(parent);
  g.name = "Striped awning corner shop";
  box(g, "#dcae9e", [0, 3, 0], [5.4, 6, 4]);
  box(g, stone, [0, 6.1, 0], [5.8, 0.35, 4.4]);
  for (const x of [-1.7, 0, 1.7]) {
    box(g, glass, [x, 4.6, 2.04], [1.1, 1.5, 0.08]);
    box(g, stone, [x, 4.6, 2.12], [0.08, 1.5, 0.05]);
  }
  for (const x of [-1.6, 1.6]) box(g, "#9ac9cf", [x, 1.35, 2.06], [1.55, 2, 0.08]);
  box(g, metal, [0, 1.35, 2.06], [0.95, 2.7, 0.1]);
  box(g, "#b6dce0", [0, 1.7, 2.13], [0.72, 1.5, 0.05]);
  for (let i = 0; i < 8; i++) {
    const awning = box(g, i % 2 ? "#fff0d2" : "#679d91", [-2.45 + i * 0.7, 2.95, 2.55], [0.7, 0.16, 1.3]);
    awning.rotation.x = 0.16;
    box(g, i % 2 ? "#fff0d2" : "#679d91", [-2.45 + i * 0.7, 2.72, 3.17], [0.7, 0.35, 0.08]);
  }
  g.scale.setScalar(scale);
  return g;
}

export function parkedTaxi(parent, scale = 1) {
  const g = group(parent);
  g.name = "Friendly parked yellow taxi";
  box(g, "#efc25d", [0, 0.83, 0], [1.9, 0.85, 3.5]);
  box(g, "#efc25d", [0, 1.45, -0.1], [1.65, 0.65, 1.9]);
  box(g, glass, [0, 1.5, 0.87], [1.4, 0.45, 0.04]);
  box(g, glass, [0, 1.5, -1.07], [1.4, 0.45, 0.04]);
  for (const side of [-1, 1]) {
    for (const z of [-0.58, 0.3]) box(g, glass, [side * 0.84, 1.5, z], [0.04, 0.45, 0.74]);
    for (const z of [-1.1, 1.1]) {
      const wheel = cylinder(g, "#52636b", [side * 0.98, 0.48, z], [0.4, 0.17, 0.4]);
      wheel.rotation.z = Math.PI / 2;
      const hub = cylinder(g, stone, [side * 1.08, 0.48, z], [0.21, 0.04, 0.21]);
      hub.rotation.z = Math.PI / 2;
    }
    box(g, "#fff0ba", [side * 0.62, 0.85, 1.78], [0.38, 0.25, 0.04]);
    box(g, "#d68d8d", [side * 0.62, 0.85, -1.78], [0.3, 0.2, 0.04]);
  }
  box(g, "#fff0ba", [0, 1.92, -0.1], [0.75, 0.26, 0.4]);
  g.scale.setScalar(scale);
  return g;
}

export function cityPlanter(parent, scale = 1) {
  const g = group(parent);
  g.name = "Boulevard tree planter";
  box(g, stone, [0, 0.35, 0], [1.8, 0.7, 1.8]);
  box(g, "#907c6a", [0, 0.72, 0], [1.5, 0.08, 1.5]);
  cylinder(g, "#907c6a", [0, 1.7, 0], [0.18, 2.1, 0.18]);
  round(g, "#83b79a", [0, 3.2, 0], [1.35, 1.45, 1.2]);
  round(g, "#97c2a6", [-0.4, 3.7, 0.3], [0.8, 0.9, 0.85]);
  g.scale.setScalar(scale);
  return g;
}

export function cityBench(parent, scale = 1) {
  const g = group(parent);
  g.name = "Park bench and flower box";
  for (const z of [-0.25, 0, 0.25]) box(g, "#b88d70", [0, 0.85, z], [2.4, 0.15, 0.2]);
  for (const y of [1.25, 1.6]) box(g, "#b88d70", [0, y, -0.43], [2.4, 0.2, 0.13]);
  for (const x of [-0.85, 0.85]) {
    box(g, metal, [x, 0.43, 0], [0.14, 0.85, 0.7]);
    box(g, metal, [x, 1.25, -0.43], [0.12, 1.2, 0.12]);
  }
  box(g, stone, [1.8, 0.35, 0], [0.9, 0.7, 0.9]);
  for (let i = 0; i < 3; i++) round(g, i % 2 ? "#f3d691" : "#dfa1b4", [1.6 + i * 0.2, 0.85, (i % 2) * 0.2], [0.2, 0.3, 0.2]);
  g.scale.setScalar(scale);
  return g;
}

export function streetlight(parent, scale = 1) {
  const g = group(parent);
  g.name = "Boulevard streetlight";
  cylinder(g, metal, [0, 3, 0], [0.1, 6, 0.1]);
  cylinder(g, metal, [0, 0.25, 0], [0.25, 0.5, 0.25]);
  box(g, metal, [0.5, 6, 0], [1.2, 0.15, 0.15]);
  box(g, stone, [1, 5.88, 0], [0.75, 0.2, 0.5]);
  mesh(g, geometry("box", () => new THREE.BoxGeometry(1, 1, 1)), "#fff1ba", [1, 5.76, 0], [0.6, 0.04, 0.36], { emissive: "#f4d88f", emissiveIntensity: 0.25 });
  g.scale.setScalar(scale);
  return g;
}

export function clockTower(parent, scale = 1) {
  const g = group(parent);
  g.name = "Downtown station clock tower";
  box(g, stone, [0, 6, 0], [4, 12, 4]);
  box(g, "#c09b85", [0, 12, 0], [4.5, 4.1, 4.5]);
  box(g, stone, [0, 14.2, 0], [5, 0.5, 5]);
  box(g, "#91a8bb", [0, 15.2, 0], [3.2, 1.6, 3.2]);
  cylinder(g, metal, [0, 17, 0], [0.13, 2.2, 0.13]);
  for (let face = 0; face < 4; face++) {
    const clock = group(g, [0, 12.2, 0]);
    clock.rotation.y = face * Math.PI / 2;
    round(clock, "#fff3d4", [0, 0, 2.28], [1.35, 1.35, 0.08]);
    box(clock, metal, [0, 0.4, 2.39], [0.1, 0.9, 0.04]);
    const hand = box(clock, metal, [0.3, 0.15, 2.39], [0.72, 0.1, 0.04]);
    hand.rotation.z = 0.4;
    for (const [x, y] of [[0, 1.05], [1.05, 0], [0, -1.05], [-1.05, 0]])
      box(clock, metal, [x, y, 2.39], [0.1, 0.16, 0.04]);
  }
  g.scale.setScalar(scale);
  return g;
}
