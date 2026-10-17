import * as THREE from "three";
import { group, mesh, geometry, cylinder, cone, bake, material } from "../art/primitives.js";
import { coursePoint } from "../config/levels.js";

const aqua = "#62b6bc", pink = "#e790a7", gold = "#f3ce81";
const pebble = (p, c, pos, scale) => mesh(p,
  geometry("sea-pebble", () => new THREE.SphereGeometry(1, 12, 8)), c, pos, scale);

function branch(parent, color, from, to, radius) {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const center = a.clone().add(b).multiplyScalar(0.5);
  const stem = cylinder(parent, color, center.toArray(), [radius, a.distanceTo(b), radius]);
  stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize());
  pebble(parent, color, to, [radius, radius, radius]);
}

export function coralFan(parent, scale = 1) {
  const g = group(parent);
  g.name = "Branching rose coral";
  branch(g, pink, [0, 0, 0], [0, 3.5, 0], 0.2);
  for (const side of [-1, 1]) {
    branch(g, pink, [0, 0.8, 0], [side * 1.1, 2, 0], 0.18);
    branch(g, pink, [side * 1.1, 2, 0], [side * 1.5, 3.2, 0.1], 0.14);
    branch(g, pink, [0, 2.1, 0], [side * 0.8, 3.8, -0.12], 0.14);
    branch(g, pink, [side * 1.1, 2, 0], [side * 2, 2.7, -0.1], 0.12);
  }
  pebble(g, "#8caeae", [0, 0.15, 0], [1.2, 0.3, 0.8]);
  g.scale.setScalar(scale);
  return g;
}

export function kelp(parent, scale = 1) {
  const g = group(parent);
  g.name = "Kelp fronds";
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.6, h = 3 + (i % 2) * 1.4;
    branch(g, "#489f91", [x, 0, 0], [x + 0.25, h, 0], 0.07);
    for (let j = 0; j < 4; j++) {
      const side = j % 2 ? 1 : -1;
      const leaf = pebble(g, j % 2 ? "#68bca2" : "#499f98",
        [x + side * 0.32, 0.8 + j * h / 4, 0], [0.35, 0.72, 0.11]);
      leaf.rotation.z = side * -0.45;
    }
  }
  g.scale.setScalar(scale);
  return g;
}

export function tubeSponge(parent, scale = 1) {
  const g = group(parent);
  g.name = "Lavender tube sponges";
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.85, y = 1 + (i % 2) * 0.55;
    cylinder(g, "#b5a0d4", [x, y, 0], [0.48, y * 2, 0.48]);
    cylinder(g, "#6a84a5", [x, y * 2 + 0.01, 0], [0.32, 0.035, 0.32]);
    mesh(g, geometry("sponge-rim", () => new THREE.TorusGeometry(0.4, 0.1, 6, 12)),
      "#c8b5e0", [x, y * 2, 0]).rotation.x = Math.PI / 2;
  }
  g.scale.setScalar(scale);
  return g;
}

export function seaStar(parent, scale = 1) {
  const g = group(parent);
  g.name = "Golden sea star";
  pebble(g, gold, [0, 0.2, 0], [0.46, 0.2, 0.46]);
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5;
    const arm = pebble(g, gold, [Math.sin(a) * 0.6, 0.18, Math.cos(a) * 0.6], [0.25, 0.16, 0.85]);
    arm.rotation.y = a;
  }
  g.scale.setScalar(scale);
  return g;
}

export function pearlShell(parent, scale = 1) {
  const g = group(parent);
  g.name = "Open pearl shell";
  pebble(g, "#e8b2bd", [0, 0.5, 0.2], [1.7, 0.38, 1.3]);
  pebble(g, "#fff0d9", [0, 0.75, 0.2], [1.48, 0.14, 1.12]);
  const lid = group(g, [0, 0.6, -0.7]);
  lid.rotation.x = -0.18;
  pebble(lid, "#e8b2bd", [0, 1.1, 0], [1.65, 1.5, 0.22]);
  for (let i = -3; i <= 3; i++) {
    const a = i * 0.27;
    branch(lid, "#f8d4cc", [0, 0, 0.22], [Math.sin(a) * 1.55, Math.cos(a) * 2.35, 0.22], 0.055);
  }
  pebble(g, "#fff6df", [0, 1.25, 0.35], [0.65, 0.65, 0.65]);
  g.scale.setScalar(scale);
  return g;
}

export function tropicalFish(parent, scale = 1) {
  const g = group(parent);
  g.name = "Friendly striped reef fish";
  pebble(g, gold, [0, 0, 0], [0.9, 0.55, 0.3]);
  const tail = cone(g, "#ed9b80", [-1.03, 0, 0], [0.55, 0.85, 0.2]);
  tail.rotation.z = -Math.PI / 2;
  for (const x of [-0.35, 0.05]) pebble(g, "#fff4d7", [x, 0, 0], [0.12, 0.53, 0.32]);
  for (const side of [-1, 1]) {
    pebble(g, "#34516c", [0.55, 0.12, side * 0.27], [0.09, 0.1, 0.045]);
    const fin = pebble(g, "#ed9b80", [0, -0.1, side * 0.37], [0.32, 0.08, 0.2]);
    fin.rotation.y = side * 0.4;
  }
  cone(g, "#ed9b80", [-0.1, 0.53, 0], [0.3, 0.45, 0.12]);
  g.scale.setScalar(scale);
  return g;
}

export function coralGate(parent) {
  const g = group(parent);
  g.name = "Coral reef gateway";
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) pebble(g, aqua, [side * 8, i * 1.7 + 0.8, 0], [1.5, 1.2, 1.5]);
    coralFan(g, 0.75).position.set(side * 9.3, 0, 0);
    tubeSponge(g, 0.8).position.set(side * 7.8, 4.2, 0);
  }
  mesh(g, geometry("coral-arch", () => new THREE.TorusGeometry(8, 0.9, 8, 24, Math.PI)), aqua, [0, 4.2, 0]);
  for (const side of [-1, 1]) {
    const star = seaStar(g, 1.1);
    star.position.set(side * 5.8, 9.5, 0.9);
    star.rotation.x = Math.PI / 2;
  }
  return g;
}

// A fixed-size school and a single instanced bubble draw. Absolute scene time
// makes pause and Gentle motion deterministic without introducing another clock.
export class ReefLife {
  constructor(parent, level) {
    this.root = group(parent);
    this.root.name = "Reef fish and bubbles";
    this.level = level;
    this.fish = [];
    for (let i = 0; i < 24; i++) {
      const fish = tropicalFish(this.root, 0.6 + (i % 3) * 0.15);
      bake(fish);
      this.fish.push(fish);
    }
    const mat = material("#daf8f6", { transparent: true, opacity: 0.48, roughness: 0.2, depthWrite: false });
    this.bubbles = new THREE.InstancedMesh(
      geometry("reef-bubble", () => new THREE.TorusGeometry(1, 0.085, 4, 12)), mat, 64);
    this.bubbles.name = "Rising sea bubbles";
    this.bubbles.frustumCulled = false;
    this.root.add(this.bubbles);
    this.dummy = new THREE.Object3D();
  }
  update(time, s) {
    for (let i = 0; i < this.fish.length; i++) {
      const fish = this.fish[i];
      const p = coursePoint(this.level, s + 15 + Math.floor(i / 3) * 10 + Math.sin(time * 0.3 + i) * 2,
        (i % 2 ? 1 : -1) * (8.5 + (i % 3) * 1.5));
      fish.position.set(p.x, p.y + 3.5 + i % 3 + Math.sin(time * 0.7 + i) * 0.25, p.z);
      fish.rotation.y = p.yaw + (i % 2 ? 0.4 : Math.PI - 0.4);
    }
    for (let i = 0; i < 64; i++) {
      const p = coursePoint(this.level, s - 6 + i * 1.5,
        (i % 2 ? 1 : -1) * (6.8 + i % 7));
      this.dummy.position.set(p.x, p.y + ((time * 0.55 + i * 0.73) % 11), p.z);
      this.dummy.rotation.set(0, p.yaw, 0);
      this.dummy.scale.setScalar(0.12 + (i % 5) * 0.06);
      this.dummy.updateMatrix();
      this.bubbles.setMatrixAt(i, this.dummy.matrix);
    }
    this.bubbles.instanceMatrix.needsUpdate = true;
  }
}
