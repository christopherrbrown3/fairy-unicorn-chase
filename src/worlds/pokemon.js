import * as THREE from "three";
import { group, box, cylinder, mesh, geometry, tube } from "../art/primitives.js";

const orb = (p, c, pos, scale = [1, 1, 1]) => mesh(p,
  geometry("pokemon-orb", () => new THREE.SphereGeometry(1, 16, 10)), c, pos, scale);
const eyes = (g, y, z, spread = 0.3, size = 0.12) => {
  for (const x of [-spread, spread]) {
    orb(g, "#273a49", [x, y, z], [size, size * 1.3, size * 0.4]);
    orb(g, "#fffaf2", [x - size * 0.2, y + size * 0.4, z + size * 0.4], [size * 0.3, size * 0.35, size * 0.2]);
  }
};
const smile = (g, y, z, size = 0.14) => {
  mesh(g, geometry("pokemon-smile", () => new THREE.TorusGeometry(1, 0.13, 5, 12, Math.PI)), "#4c4051", [0, y, z], [size, size * 0.6, size]).rotation.z = Math.PI;
};

export function pokeBall(parent, scale = 1) {
  const g = group(parent);
  g.name = "Poké Ball";
  mesh(g, geometry("poke-red", () => new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2)), "#e46b76", [0, 1.1, 0]);
  mesh(g, geometry("poke-white", () => new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2)), "#fff7e7", [0, 1.1, 0]);
  cylinder(g, "#405368", [0, 1.1, 0], [1.01, 0.12, 1.01]);
  orb(g, "#405368", [0, 1.1, 0.99], [0.28, 0.28, 0.1]);
  orb(g, "#fff9ee", [0, 1.1, 1.08], [0.18, 0.18, 0.05]);
  g.scale.setScalar(scale);
  return g;
}

export function pikachu(parent, scale = 1) {
  const g = group(parent), yellow = "#ffda63";
  g.name = "Pikachu";
  orb(g, yellow, [0, 1, 0], [0.68, 0.9, 0.5]);
  orb(g, yellow, [0, 2, 0.12], [0.78, 0.68, 0.62]);
  for (const x of [-0.43, 0.43]) {
    const ear = group(g, [x, 2.48, 0.08]);
    ear.rotation.z = -x * 0.7;
    orb(ear, yellow, [0, 0.47, 0], [0.17, 0.65, 0.12]);
    orb(ear, "#41404b", [0, 0.93, 0], [0.14, 0.25, 0.115]);
    orb(g, "#ee7b7c", [x * 1.3, 1.8, 0.57], [0.16, 0.14, 0.07]);
    orb(g, yellow, [x, 0.26, 0.25], [0.29, 0.18, 0.42]);
    orb(g, yellow, [x * 1.4, 1.2, 0.2], [0.22, 0.4, 0.22]).rotation.z = -x;
  }
  eyes(g, 2.1, 0.68, 0.29, 0.11);
  orb(g, "#473f47", [0, 1.91, 0.75], [0.07, 0.045, 0.04]);
  smile(g, 1.77, 0.72, 0.12);
  const shape = new THREE.Shape();
  [[0, 0], [0.4, 0.25], [0.16, 0.63], [0.8, 0.95], [0.54, 1.3], [1.25, 1.7], [1.5, 1.22], [0.95, 0.91], [1.16, 0.57], [0.57, 0.3], [0.68, 0.02], [0.1, -0.12]].forEach(([x,y], i) => i ? shape.lineTo(x,y) : shape.moveTo(x,y));
  shape.closePath();
  mesh(g, geometry("pikachu-tail", () => {
    const tail = new THREE.ExtrudeGeometry(shape, {depth: 0.12, bevelEnabled: false});
    // Static scenery batches by material; match the indexed body meshes.
    tail.setIndex(Array.from({length: tail.attributes.position.count}, (_, i) => i));
    return tail;
  }), yellow, [0.15, 0.7, -0.5]);
  g.scale.setScalar(scale);
  return g;
}

export function bulbasaur(parent, scale = 1) {
  const g = group(parent), green = "#80c8b2";
  g.name = "Bulbasaur";
  orb(g, green, [0, 0.85, -0.15], [0.85, 0.65, 1.1]);
  orb(g, green, [0, 1.12, 0.85], [0.9, 0.7, 0.7]);
  for (const x of [-0.58, 0.58]) {
    orb(g, green, [x, 1.7, 0.7], [0.25, 0.4, 0.25]);
    for (const z of [-0.6, 0.65]) {
      orb(g, green, [x, 0.35, z], [0.31, 0.45, 0.38]);
      for (const dx of [-0.11, 0.11]) orb(g, "#ffefdb", [x + dx, 0.15, z + 0.3], [0.07, 0.06, 0.11]);
    }
    orb(g, "#4e9b83", [x, 1.25, 1.42], [0.13, 0.11, 0.03]);
  }
  eyes(g, 1.32, 1.48, 0.39, 0.14);
  smile(g, 0.94, 1.54, 0.25);
  orb(g, "#5eaa65", [0, 1.7, -0.38], [0.85, 0.85, 0.8]);
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5;
    const leaf = orb(g, i % 2 ? "#74ba6d" : "#4c975d", [Math.sin(a) * 0.32, 2, -0.38 + Math.cos(a) * 0.32], [0.3, 0.78, 0.35]);
    leaf.rotation.z = -Math.sin(a) * 0.45;
    leaf.rotation.x = Math.cos(a) * 0.45;
  }
  g.scale.setScalar(scale);
  return g;
}

export function squirtle(parent, scale = 1) {
  const g = group(parent), blue = "#86cddd";
  g.name = "Squirtle";
  orb(g, "#fff0cf", [0, 1.04, -0.1], [0.77, 0.9, 0.55]);
  orb(g, "#b98b63", [0, 1.08, -0.32], [0.7, 0.8, 0.52]);
  orb(g, "#f4db9b", [0, 1.03, 0.26], [0.63, 0.74, 0.34]);
  orb(g, blue, [0, 2.02, 0.15], [0.74, 0.65, 0.61]);
  for (const x of [-0.6, 0.6]) {
    orb(g, blue, [x, 1.22, 0.1], [0.32, 0.3, 0.45]);
    orb(g, blue, [x * 0.7, 0.27, 0.12], [0.28, 0.25, 0.48]);
  }
  for (const y of [0.7, 1.15]) tube(g, "#c3a76e", [[-0.5, y, 0.43], [0, y - 0.04, 0.61], [0.5, y, 0.43]], 0.025);
  tube(g, blue, [[0, 0.6, -0.65], [0.5, 0.6, -1.05], [0.9, 0.95, -1.05], [0.75, 1.18, -1.05], [0.56, 1.03, -1.05]], 0.18);
  eyes(g, 2.15, 0.7, 0.29, 0.14);
  smile(g, 1.85, 0.75, 0.2);
  g.scale.setScalar(scale);
  return g;
}

export function pokemonCenter(parent) {
  const g = group(parent);
  g.name = "Pokémon Center";
  box(g, "#fff0d8", [0, 2.6, 0], [8, 5.2, 4.6]);
  box(g, "#df7884", [0, 5.3, 0], [9.2, 1, 5.8]);
  box(g, "#e7939a", [0, 6, 0], [7.7, 0.6, 4.5]);
  box(g, "#5babbc", [0, 1.5, 2.34], [2, 3, 0.08]);
  box(g, "#f4e3bc", [0, 1.5, 2.42], [0.12, 3, 0.08]);
  for (const x of [-2.6, 2.6]) box(g, "#98d7de", [x, 2.5, 2.34], [1.8, 1.5, 0.08]);
  box(g, "#df7884", [0, 3.5, 2.8], [3.4, 0.3, 1.4]);
  pokeBall(g, 1.1).position.set(0, 6.2, 0);
  return g;
}

export function pokeGate(parent) {
  const g = group(parent);
  g.name = "Poké Ball garden gateway";
  for (const x of [-8, 8]) {
    cylinder(g, "#e6d6ad", [x, 2.4, 0], [0.7, 4.8, 0.7]);
    pokeBall(g, 1.5).position.set(x, 4.2, 0);
  }
  mesh(g, geometry("poke-garden-arch", () => new THREE.TorusGeometry(8, 0.32, 6, 24, Math.PI)), "#df7884", [0, 4.5, 0]);
  return g;
}
