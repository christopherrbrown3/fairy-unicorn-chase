import * as THREE from "three";
import { box, mesh, geometry, group } from "../art/primitives.js";

export function grassBlock(parent, size = 2) {
  const g = group(parent);
  box(g, "#916344", [0, size / 2, 0], [size, size, size]);
  box(g, "#72b348", [0, size - 0.12, 0], [size + 0.02, 0.27, size + 0.02]);
  for (const x of [-0.28, 0.2]) {
    box(g, "#ad8259", [x * size, size * 0.4, size / 2 + 0.012], [size * 0.17, size * 0.2, 0.025]);
    box(g, "#5d953a", [x * size, size - 0.3, size / 2 + 0.025], [size * 0.24, size * 0.15, 0.04]);
  }
  return g;
}

export function blockTree(parent, scale = 1) {
  const g = group(parent);
  g.name = "Block oak";
  box(g, "#785138", [0, 2.2, 0], [1, 4.4, 1]);
  for (const x of [-0.28, 0.24]) box(g, "#a67b48", [x, 2.2, 0.51], [0.12, 4.3, 0.02]);
  box(g, "#4d873d", [0, 4.4, 0], [4.2, 1.8, 4.2]);
  box(g, "#66a047", [0.3, 5.6, 0], [3.4, 1.1, 3.4]);
  box(g, "#80b455", [-0.25, 6.35, 0.15], [2.3, 0.7, 2.3]);
  for (const x of [-1.25, 0.25, 1.1]) box(g, "#75ac50", [x, 4.6, 2.12], [0.6, 0.6, 0.04]);
  g.scale.setScalar(scale);
  return g;
}

export function diamondOre(parent, scale = 1) {
  const g = group(parent);
  g.name = "Diamond ore";
  box(g, "#8b9699", [0, 1, 0], [2, 2, 2]);
  for (const [x, y] of [[-0.55, 0.5], [0.3, 1.35], [0.6, 0.5], [-0.45, 1.6]]) {
    box(g, "#63e6e2", [x, y, 1.015], [0.38, 0.32, 0.04]);
    box(g, "#3798af", [x + 0.08, y - 0.12, 1.04], [0.22, 0.12, 0.04]);
    box(g, "#63e6e2", [1.015, y, x], [0.04, 0.32, 0.38]);
  }
  g.scale.setScalar(scale);
  return g;
}

export function blockPig(parent, scale = 1) {
  const g = group(parent);
  g.name = "Block pig";
  box(g, "#eda4b0", [0, 1.15, 0], [1.3, 0.9, 1.8]);
  box(g, "#f6b8c0", [0, 1.55, 1.1], [1.15, 1, 0.85]);
  box(g, "#e68c9c", [0, 1.35, 1.62], [0.6, 0.36, 0.18]);
  for (const x of [-0.35, 0.35]) {
    box(g, "#fff7e5", [x, 1.7, 1.54], [0.23, 0.22, 0.04]);
    box(g, "#3b3848", [x, 1.7, 1.57], [0.1, 0.15, 0.03]);
    box(g, "#a96075", [x * 0.5, 1.35, 1.73], [0.09, 0.08, 0.03]);
    for (const z of [-0.6, 0.65]) box(g, "#c87d93", [x, 0.45, z], [0.4, 0.85, 0.4]);
  }
  g.scale.setScalar(scale);
  return g;
}

export function friendlyCreeper(parent) {
  const g = group(parent);
  g.name = "Friendly creeper";
  box(g, "#6eaf4e", [0, 1.35, 0], [0.8, 1.5, 0.65]);
  box(g, "#86c55a", [0, 2.5, 0], [1.2, 1.2, 1.2]);
  for (const x of [-0.35, 0.35]) {
    box(g, "#334c36", [x, 2.65, 0.62], [0.24, 0.24, 0.04]);
    for (const z of [-0.35, 0.35]) box(g, "#568d41", [x, 0.35, z], [0.5, 0.7, 0.5]);
  }
  box(g, "#334c36", [0, 2.3, 0.62], [0.23, 0.28, 0.04]);
  box(g, "#334c36", [0, 2.1, 0.62], [0.6, 0.22, 0.04]);
  for (const x of [-0.2, 0.2]) box(g, "#334c36", [x, 1.98, 0.62], [0.18, 0.18, 0.04]);
  return g;
}

export function torch(parent) {
  const g = group(parent);
  box(g, "#93663f", [0, 1.4, 0], [0.2, 2.8, 0.2]);
  mesh(g, geometry("box", () => new THREE.BoxGeometry(1, 1, 1)), "#ffd36a", [0, 2.85, 0], [0.35, 0.55, 0.35], {emissive: "#ffb53e", emissiveIntensity: 0.8});
  return g;
}

export function blockHill(parent, size = 1) {
  const g = group(parent);
  for (let row = 0; row < 3; row++) {
    const width = (3 - row) * 6;
    box(g, row % 2 ? "#986b49" : "#825d45", [0, row * 4 + 2, 0], [width, 4, width]);
    box(g, "#75ad4f", [0, row * 4 + 4, 0], [width + 0.02, 0.25, width + 0.02]);
  }
  blockTree(g).position.set(0, 12.2, 0);
  g.scale.setScalar(size);
  return g;
}

export function mineGate(parent) {
  const g = group(parent);
  g.name = "Block mine gateway";
  for (const x of [-8.5, 8.5]) {
    for (let y = 0; y < 4; y++) diamondOre(g, 1.3).position.set(x, y * 2.6, 0);
    torch(g).position.set(Math.sign(x) * 6.7, 0, -2);
    grassBlock(g, 2).position.set(x, 0, 3);
  }
  box(g, "#795438", [0, 10.8, 0], [20, 1, 2.6]);
  box(g, "#c19159", [0, 10.8, -1.32], [18, 0.3, 0.04]);
  return g;
}

export function blockCloud(parent, scale = 1) {
  const g = group(parent);
  box(g, "#fffaf0", [0, 0, 0], [8, 1.4, 3]);
  box(g, "#edf4f7", [2, 0.2, 1.5], [5, 1.2, 3]);
  g.scale.setScalar(scale);
  return g;
}
