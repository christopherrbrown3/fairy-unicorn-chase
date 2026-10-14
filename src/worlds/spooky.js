import * as THREE from "three";
import { box, cylinder, mesh, geometry, group, bake } from "../art/primitives.js";

const glow = { emissive: "#ffc46b", emissiveIntensity: 0.8 };
const sphere = (g, color, p, s, extra = {}) => mesh(g,
  geometry("spooky-orb", () => new THREE.SphereGeometry(1, 12, 8)), color, p, s, extra);
const litBox = (g, p, s) => mesh(g, geometry("box", () => new THREE.BoxGeometry(1, 1, 1)), "#ffe2a0", p, s, glow);

export function pumpkin(parent, scale = 1) {
  const g = group(parent);
  for (let i = 0; i < 7; i++) {
    const a = i * Math.PI * 2 / 7;
    sphere(g, i % 2 ? "#e8a05c" : "#f8b663", [Math.sin(a) * 0.35, 0.65, Math.cos(a) * 0.35], [0.43, 0.6, 0.43]);
  }
  cylinder(g, "#69816b", [0, 1.3, 0], [0.12, 0.3, 0.12]).rotation.z = -0.2;
  for (const x of [-0.25, 0.25]) sphere(g, "#fff0b4", [x, 0.78, 0.75], [0.09, 0.13, 0.035], glow);
  mesh(g, geometry("pumpkin-smile", () => new THREE.TorusGeometry(0.26, 0.045, 5, 12, Math.PI)), "#fff0b4", [0, 0.55, 0.77], [1, 0.65, 1], glow).rotation.z = Math.PI;
  g.scale.setScalar(scale);
  return g;
}

export function friendlyGhost(parent, scale = 1) {
  const g = group(parent);
  g.name = "Friendly ghost";
  const white = "#e9eefc";
  sphere(g, white, [0, 0.9, 0], [0.65, 0.95, 0.45]);
  for (const x of [-0.43, 0, 0.43]) sphere(g, white, [x, 0.22, 0], [0.25, 0.3, 0.4]);
  for (const x of [-0.23, 0.23]) {
    sphere(g, "#444260", [x, 1.1, 0.42], [0.07, 0.1, 0.04]);
    sphere(g, "#f5b7cc", [x * 1.5, 0.9, 0.4], [0.1, 0.055, 0.03]);
  }
  sphere(g, "#444260", [0, 0.87, 0.45], [0.08, 0.055, 0.025]);
  for (const x of [-0.7, 0.7]) sphere(g, white, [x, 0.85, 0], [0.35, 0.17, 0.22]).rotation.z = x;
  g.scale.setScalar(scale);
  bake(g);
  return g;
}

function window(g, x, y, z) {
  box(g, "#c6a5c2", [x, y, z], [0.95, 1.45, 0.15]);
  litBox(g, [x, y, z + 0.1], [0.7, 1.2, 0.08]);
  box(g, "#655878", [x, y, z + 0.16], [0.08, 1.25, 0.05]);
  box(g, "#655878", [x, y, z + 0.16], [0.75, 0.08, 0.05]);
}

export function spookyHouse(parent, scale = 1) {
  const g = group(parent);
  g.name = "Spooky house";
  box(g, "#91839d", [0, 2.8, 0], [4.8, 5.6, 3.4]);
  const roof = mesh(g, geometry("spooky-roof", () => new THREE.ConeGeometry(1, 1, 4)), "#514866", [0, 6.6, 0], [4.1, 3, 3.1]);
  roof.rotation.y = Math.PI / 4;
  box(g, "#86758c", [1.2, 7.1, -0.5], [0.6, 2.2, 0.7]).rotation.z = -0.14;
  box(g, "#594c6d", [0, 1.25, 1.75], [1.25, 2.5, 0.1]);
  sphere(g, "#ffd79a", [0.4, 1.25, 1.84], [0.08, 0.08, 0.06], glow);
  for (const x of [-1.5, 1.5]) for (const y of [1.5, 4]) window(g, x, y, 1.75);
  sphere(g, "#ffe2a0", [0, 5.8, 1.9], [0.4, 0.4, 0.08], glow);
  for (const x of [-1.2, 1.2]) pumpkin(g, 0.65).position.set(x, 0, 2.2);
  g.scale.setScalar(scale);
  return g;
}

// The chase passes through a broad, well-lit hallway. All walls stay off the road.
export function spookyHall(parent) {
  const g = group(parent);
  g.name = "Spooky house hallway";
  for (const x of [-10, 10]) {
    spookyHouse(g, 1.5).position.set(x, 0, 0);
    box(g, "#8e7e9b", [Math.sign(x) * 7.3, 3.5, -3], [1.2, 7, 10]);
    for (const z of [-6, -2, 2]) {
      litBox(g, [Math.sign(x) * 6.65, 3.2, z], [0.12, 1.2, 0.65]);
      pumpkin(g, 0.9).position.set(Math.sign(x) * 6, 0, z + 0.8);
    }
  }
  box(g, "#655571", [0, 8.2, -3], [15.8, 1, 10]);
  for (const z of [-7, -3, 1]) box(g, "#c2a2bd", [0, 7.5, z], [14, 0.35, 0.35]);
  window(g, 0, 8.2, 2.1);
  return g;
}
