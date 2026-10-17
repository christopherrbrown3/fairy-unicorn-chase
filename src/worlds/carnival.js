import * as THREE from "three";
import { group, mesh, geometry, box, cylinder, cone } from "../art/primitives.js";

// A confectionery fairground, distinct from Candy Wonderland's lollipop garden.
// Low-resolution shared shapes are baked with the surrounding scenery chunks.
const cream = "#fff2d5", coral = "#ed748c", mint = "#7fcdb6";
const candyColors = [coral, mint, "#b39adb", "#f6c665"];
const sweet = (p, color, pos, scale) => mesh(p,
  geometry("carnival-sweet", () => new THREE.SphereGeometry(1, 12, 8)),
  color, pos, scale);

function sprinkles(parent, y, radius, count = 8) {
  for (let i = 0; i < count; i++) {
    const a = i * Math.PI * 2 / count;
    const sprinkle = box(parent, candyColors[i % 4],
      [Math.sin(a) * radius, y + Math.sin(a * 3) * 0.08, Math.cos(a) * radius],
      [0.26, 0.09, 0.1]);
    sprinkle.rotation.y = a + 0.7;
  }
}

export function peppermint(parent, scale = 1) {
  const g = group(parent);
  g.name = "Peppermint pinwheel";
  cylinder(g, cream, [0, 2.2, 0], [0.13, 4.4, 0.13]);
  const disk = cylinder(g, cream, [0, 4.5, 0], [1.35, 0.36, 1.35]);
  disk.rotation.x = Math.PI / 2;
  // Repeated curved wedges on both faces make the peppermint readable on turns.
  const wedge = geometry("peppermint-wedge", () => new THREE.CircleGeometry(1.28, 8, 0, Math.PI / 5));
  for (const side of [-1, 1]) for (let i = 0; i < 5; i++) {
    const stripe = mesh(g, wedge, coral, [0, 4.5, side * 0.19]);
    stripe.rotation.set(0, side < 0 ? Math.PI : 0, i * Math.PI * 2 / 5);
  }
  g.scale.setScalar(scale);
  return g;
}

export function wrappedSweet(parent, scale = 1) {
  const g = group(parent);
  g.name = "Wrapped fruit sweet";
  sweet(g, "#b39adb", [0, 1.1, 0], [1.35, 0.75, 0.75]);
  for (const x of [-1.55, 1.55]) {
    const wrapper = cone(g, coral, [x, 1.1, 0], [0.8, 1.05, 0.8]);
    wrapper.rotation.z = Math.sign(x) * Math.PI / 2;
  }
  cylinder(g, cream, [0, 1.1, 0], [0.77, 0.22, 0.77]).rotation.z = Math.PI / 2;
  g.scale.setScalar(scale);
  return g;
}

export function gummyBear(parent, scale = 1) {
  const g = group(parent);
  g.name = "Friendly gummy bear";
  const color = mint;
  sweet(g, color, [0, 1.1, 0], [0.73, 0.95, 0.5]);
  sweet(g, color, [0, 2.15, 0], [0.78, 0.68, 0.54]);
  for (const side of [-1, 1]) {
    sweet(g, color, [side * 0.54, 2.7, 0], [0.3, 0.32, 0.24]);
    sweet(g, color, [side * 0.7, 1.25, 0], [0.3, 0.5, 0.3]);
    sweet(g, color, [side * 0.44, 0.32, 0.18], [0.38, 0.34, 0.44]);
    sweet(g, "#385669", [side * 0.27, 2.27, 0.5], [0.085, 0.11, 0.04]);
  }
  sweet(g, cream, [0, 1.92, 0.5], [0.35, 0.22, 0.12]);
  sweet(g, "#385669", [0, 2.02, 0.62], [0.1, 0.07, 0.035]);
  g.scale.setScalar(scale);
  return g;
}

export function cupcake(parent, scale = 1) {
  const g = group(parent);
  g.name = "Cupcake sweet stall";
  mesh(g, geometry("cupcake-wrapper", () => new THREE.CylinderGeometry(1.7, 1.2, 2.2, 12)),
    "#d7a36e", [0, 1.1, 0]);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    cylinder(g, cream, [Math.sin(a) * 1.42, 1.1, Math.cos(a) * 1.42], [0.06, 1.65, 0.06]);
  }
  sweet(g, cream, [0, 2.35, 0], [1.85, 0.65, 1.85]);
  sweet(g, coral, [0, 2.9, 0], [1.3, 0.65, 1.3]);
  sweet(g, cream, [0, 3.4, 0], [0.8, 0.55, 0.8]);
  sweet(g, coral, [0, 4, 0], [0.32, 0.34, 0.32]);
  sprinkles(g, 2.87, 1.25);
  g.scale.setScalar(scale);
  return g;
}

export function macaron(parent, scale = 1) {
  const g = group(parent);
  g.name = "Macaron stack";
  for (let i = 0; i < 3; i++) {
    const y = i * 1.05 + 0.3, color = candyColors[i];
    sweet(g, color, [0, y, 0], [1.35, 0.28, 1.15]);
    sweet(g, cream, [0, y + 0.25, 0], [1.3, 0.15, 1.1]);
    sweet(g, color, [0, y + 0.5, 0], [1.35, 0.28, 1.15]);
  }
  g.scale.setScalar(scale);
  return g;
}

export function gumdrops(parent, scale = 1) {
  const g = group(parent);
  g.name = "Sugar gumdrops";
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 1.1, z = i === 1 ? -0.55 : 0.25;
    sweet(g, candyColors[i + 1], [x, 0.75, z], [0.86, 1.15, 0.85]);
    sweet(g, cream, [x - 0.22, 1.3, z + 0.58], [0.12, 0.18, 0.06]);
  }
  g.scale.setScalar(scale);
  return g;
}

export function donutGate(parent) {
  const g = group(parent);
  g.name = "Sprinkle donut gateway";
  // Open arch: all supports stand beyond the 10.5-unit playable road.
  for (const x of [-8, 8]) {
    cylinder(g, "#d7a36e", [x, 1.7, 0], [1.2, 3.4, 1.2]);
    cylinder(g, cream, [x, 2.8, 0], [1.23, 0.4, 1.23]);
  }
  const arch = geometry("donut-gateway", () => new THREE.TorusGeometry(8, 1.2, 8, 28, Math.PI));
  mesh(g, arch, "#d7a36e", [0, 3.3, 0]);
  const frosting = mesh(g,
    geometry("donut-frosting", () => new THREE.TorusGeometry(8, 0.93, 8, 28, Math.PI)),
    coral, [0, 3.3, 0.78]);
  for (let i = 0; i < 15; i++) {
    const a = (i + 0.5) * Math.PI / 15;
    const sprinkle = box(g, candyColors[(i + 1) % 4],
      [Math.cos(a) * 8, 3.3 + Math.sin(a) * 8, 1.72], [0.4, 0.16, 0.12]);
    sprinkle.rotation.z = a + 0.7;
  }
  frosting.name = "Strawberry icing";
  return g;
}

export function cakePavilion(parent) {
  const g = group(parent);
  g.name = "Celebration cake pavilion";
  cylinder(g, cream, [0, 0.25, 0], [6.2, 0.5, 6.2]);
  for (let i = 0; i < 3; i++) {
    const radius = 5 - i * 1.2, y = 1.8 + i * 2.8;
    cylinder(g, i % 2 ? mint : coral, [0, y, 0], [radius, 2.8, radius]);
    cylinder(g, cream, [0, y + 1.4, 0], [radius + 0.15, 0.35, radius + 0.15]);
    for (let j = 0; j < 12; j++) {
      const a = j * Math.PI / 6;
      sweet(g, cream, [Math.sin(a) * radius, y + 1.05, Math.cos(a) * radius], [0.45, 0.6, 0.4]);
    }
  }
  peppermint(g, 0.75).position.set(0, 8.9, 0);
  return g;
}
