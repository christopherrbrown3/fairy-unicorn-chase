import * as THREE from "three";
import { group, mesh, geometry, box, cylinder, cone, material } from "../art/primitives.js";
import { coursePoint } from "../config/levels.js";

const snow = "#f3f7fa", red = "#c85b6b", green = "#438879", gold = "#f1c768";
const ball = (p, color, pos, scale) => mesh(p,
  geometry("christmas-ball", () => new THREE.SphereGeometry(1, 12, 8)), color, pos, scale);

function topper(parent, pos, size) {
  const shape = geometry("christmas-star", () => {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const a = i * Math.PI / 5 + Math.PI / 2, r = i % 2 ? 0.45 : 1;
      if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      else s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.15, bevelEnabled: false });
    geo.setIndex(Array.from({ length: geo.attributes.position.count }, (_, i) => i));
    return geo;
  });
  return mesh(parent, shape, gold, pos, [size, size, size]);
}

export function christmasTree(parent, scale = 1) {
  const g = group(parent);
  g.name = "Decorated snowy Christmas tree";
  cylinder(g, "#91715d", [0, 0.6, 0], [0.3, 1.2, 0.3]);
  for (let i = 0; i < 3; i++) {
    const r = 1.75 - i * 0.43, y = 1.65 + i * 1.17;
    cone(g, green, [0, y, 0], [r, 2.3, r]);
    cone(g, snow, [0, y + 0.65, 0], [r * 0.55, 1.05, r * 0.55]);
    for (let j = 0; j < 5; j++) {
      const a = j * Math.PI * 2 / 5 + i * 0.5;
      ball(g, j % 2 ? red : gold, [Math.sin(a) * r * 0.72, y - 0.45, Math.cos(a) * r * 0.72], [0.15, 0.18, 0.15]);
    }
  }
  topper(g, [0, 5.15, 0], 0.45);
  g.scale.setScalar(scale);
  return g;
}

export function presents(parent, scale = 1) {
  const g = group(parent);
  g.name = "Wrapped Christmas presents";
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 1.15, h = i === 1 ? 1.6 : 1;
    box(g, [red, green, "#91bcd1"][i], [x, h / 2, 0], [1.05, h, 1]);
    box(g, gold, [x, h / 2, 0], [0.16, h + 0.03, 1.04]);
    box(g, gold, [x, h + 0.015, 0], [1.08, 0.05, 0.15]);
    for (const side of [-1, 1]) {
      const bow = mesh(g, geometry("present-bow", () => new THREE.TorusGeometry(0.22, 0.045, 5, 12)), gold, [x + side * 0.16, h + 0.2, 0], [1, 0.7, 1]);
      bow.rotation.z = side * -0.4;
    }
  }
  g.scale.setScalar(scale);
  return g;
}

export function candyCane(parent, scale = 1) {
  const g = group(parent);
  g.name = "Striped Christmas candy cane";
  cylinder(g, snow, [0, 1.8, 0], [0.2, 3.6, 0.2]);
  for (let i = 0; i < 7; i++) cylinder(g, red, [0, 0.25 + i * 0.5, 0], [0.205, 0.22, 0.205]);
  mesh(g, geometry("candy-cane-hook", () => new THREE.TorusGeometry(0.68, 0.2, 8, 18, Math.PI)), snow, [0.68, 3.6, 0]);
  for (let i = 0; i < 4; i++) {
    const a = (i + 0.25) * Math.PI / 4;
    const stripe = mesh(g, geometry("cane-hook-stripe", () => new THREE.TorusGeometry(0.68, 0.205, 8, 3, 0.24)), red, [0.68, 3.6, 0]);
    stripe.rotation.z = a;
  }
  cylinder(g, snow, [1.36, 3.4, 0], [0.2, 0.4, 0.2]);
  g.scale.setScalar(scale);
  return g;
}

export function snowFriend(parent, scale = 1) {
  const g = group(parent);
  g.name = "Smiling scarf snowperson";
  ball(g, snow, [0, 0.85, 0], [0.95, 0.9, 0.85]);
  ball(g, snow, [0, 1.95, 0], [0.63, 0.65, 0.6]);
  cylinder(g, red, [0, 1.48, 0], [0.65, 0.16, 0.62]);
  box(g, red, [0.38, 1.05, 0.7], [0.22, 0.8, 0.1]);
  cylinder(g, green, [0, 2.55, 0], [0.8, 0.12, 0.8]);
  cylinder(g, green, [0, 2.85, 0], [0.5, 0.6, 0.5]);
  for (const x of [-0.22, 0.22]) ball(g, "#3a5266", [x, 2.08, 0.56], [0.065, 0.08, 0.04]);
  const nose = cone(g, "#ecad76", [0, 1.91, 0.72], [0.12, 0.45, 0.12]);
  nose.rotation.x = Math.PI / 2;
  for (let i = 0; i < 3; i++) ball(g, "#3a5266", [(i - 1) * 0.12, 1.73 + Math.abs(i - 1) * 0.04, 0.56], [0.035, 0.035, 0.03]);
  for (const y of [0.65, 1.05]) ball(g, "#3a5266", [0, y, 0.85], [0.08, 0.08, 0.04]);
  g.scale.setScalar(scale);
  return g;
}

export function holidayCottage(parent, scale = 1) {
  const g = group(parent);
  g.name = "Cozy Christmas cottage";
  box(g, "#bf8e7a", [0, 1.65, 0], [4.5, 3.3, 3.4]);
  const roof = cone(g, red, [0, 4, 0], [3.7, 2.4, 3.3]);
  roof.rotation.y = Math.PI / 4;
  // A four-sided pitched roof has a snowy ridge and generous overhang.
  roof.geometry = geometry("cottage-roof", () => new THREE.ConeGeometry(1, 1, 4));
  const cap = mesh(g, roof.geometry, snow, [0, 4.25, 0], [3.25, 1.95, 2.9]);
  cap.rotation.y = Math.PI / 4;
  box(g, green, [0, 1.1, 1.73], [1, 2.2, 0.1]);
  for (const x of [-1.45, 1.45]) {
    mesh(g, geometry("box", () => new THREE.BoxGeometry(1, 1, 1)), "#ffde8c", [x, 1.85, 1.73], [0.9, 1.1, 0.08], { emissive: "#ffb951", emissiveIntensity: 0.3 });
    box(g, "#fff1d5", [x, 1.85, 1.8], [0.08, 1.13, 0.06]);
    box(g, "#fff1d5", [x, 1.85, 1.8], [0.93, 0.08, 0.06]);
  }
  mesh(g, geometry("holiday-wreath", () => new THREE.TorusGeometry(0.43, 0.12, 6, 16)), green, [0, 3, 1.78]);
  ball(g, red, [0, 2.63, 1.88], [0.18, 0.12, 0.08]);
  box(g, "#a87469", [1.25, 4.6, -0.7], [0.65, 1.4, 0.65]);
  box(g, snow, [1.25, 5.3, -0.7], [0.85, 0.18, 0.85]);
  g.scale.setScalar(scale);
  return g;
}

export function festiveGate(parent) {
  const g = group(parent);
  g.name = "Christmas garland gateway";
  for (const side of [-1, 1]) {
    cylinder(g, red, [side * 8, 2.1, 0], [0.65, 4.2, 0.65]);
    for (let i = 0; i < 4; i++) cylinder(g, snow, [side * 8, 0.6 + i, 0], [0.66, 0.3, 0.66]);
    presents(g, 0.8).position.set(side * 9, 0, 0);
  }
  mesh(g, geometry("garland-gate", () => new THREE.TorusGeometry(8, 0.55, 8, 24, Math.PI)), green, [0, 4.2, 0]);
  for (let i = 0; i < 13; i++) {
    const a = (i + 0.5) * Math.PI / 13;
    ball(g, i % 2 ? red : gold, [Math.cos(a) * 8, 4.2 + Math.sin(a) * 8, 0.55], [0.27, 0.32, 0.27]);
  }
  topper(g, [0, 12.5, 0], 0.95);
  return g;
}

export class Snowfall {
  constructor(parent, level) {
    this.level = level;
    this.flakes = new THREE.InstancedMesh(
      geometry("snow-flake", () => new THREE.IcosahedronGeometry(1, 0)), material("#f8ffff"), 96);
    this.flakes.name = "Gentle Christmas snowfall";
    this.flakes.frustumCulled = false;
    parent.add(this.flakes);
    this.dummy = new THREE.Object3D();
  }
  update(time, s) {
    for (let i = 0; i < 96; i++) {
      const p = coursePoint(this.level, s - 8 + i * 0.85,
        ((i * 17) % 47) - 23 + Math.sin(time * 0.2 + i) * 0.35);
      this.dummy.position.set(p.x, p.y + 13 - ((time * 0.65 + i * 0.71) % 13), p.z);
      this.dummy.scale.setScalar(0.035 + i % 3 * 0.02);
      this.dummy.updateMatrix();
      this.flakes.setMatrixAt(i, this.dummy.matrix);
    }
    this.flakes.instanceMatrix.needsUpdate = true;
  }
}
