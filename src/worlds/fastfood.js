import * as THREE from "three";
import { group, mesh, geometry, box, cylinder } from "../art/primitives.js";

// Original toy-sized diner scenery, observed from real food forms. No brand art.
// Every factory is static, indexed, cached and safe for the world's material bake.
const bun = "#e5ad62", toast = "#b97845", cream = "#fff0d2";
const cheese = "#f2ce64", tomato = "#ce685c", patty = "#785446";
const lettuce = "#78a56b", teal = "#659e9f", metal = "#c8d5cb";
const pink = "#de9bab", ink = "#506c76";
const round = (p, c, pos, scale) => mesh(p,
  geometry("fastfood-round", () => new THREE.SphereGeometry(1, 12, 8)), c, pos, scale);
const smallRound = (p, c, pos, scale) => mesh(p,
  geometry("fastfood-small-round", () => new THREE.SphereGeometry(1, 8, 5)), c, pos, scale);
const ring = (p, c, pos, scale = [1, 1, 1]) => mesh(p,
  geometry("fastfood-ring", () => new THREE.TorusGeometry(1, 0.08, 6, 20)), c, pos, scale);
function lathe(key, profile) {
  return geometry(key, () => new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 24));
}
function tray(parent, width = 5.6, depth = 3.6) {
  box(parent, teal, [0, 0.14, 0], [width, 0.28, depth]);
  box(parent, cream, [0, 0.3, 0], [width - 0.28, 0.03, depth - 0.28]);
  for (const side of [-1, 1]) {
    box(parent, teal, [side * (width / 2 - 0.08), 0.33, 0], [0.16, 0.22, depth]);
    box(parent, teal, [0, 0.33, side * (depth / 2 - 0.08)], [width, 0.22, 0.16]);
  }
}
function condiment(parent, color, x, z, scale = 1) {
  const g = group(parent, [x, 0, z]);
  mesh(g, lathe("fastfood-squeeze-bottle", [[0, 0], [0.26, 0], [0.3, 0.15], [0.3, 0.8], [0.18, 1.05], [0.12, 1.08], [0.12, 1.3], [0.04, 1.47], [0, 1.47]]), color);
  box(g, cream, [0, 0.55, 0.3], [0.32, 0.35, 0.025]);
  g.scale.setScalar(scale);
  return g;
}
function napkins(parent, x, y, z) {
  box(parent, metal, [x, y + 0.2, z], [0.65, 0.4, 0.5]);
  box(parent, ink, [x, y + 0.42, z], [0.48, 0.03, 0.12]);
  box(parent, cream, [x, y + 0.57, z], [0.42, 0.3, 0.035]).rotation.z = -0.15;
}

export function burger(parent, scale = 1, variant = 0) {
  const g = group(parent);
  g.name = variant % 2 ? "Double sesame cheeseburger" : "Garden sesame cheeseburger";
  mesh(g, lathe("fastfood-bun-base", [[0, 0], [1.23, 0], [1.53, 0.14], [1.58, 0.42], [1.48, 0.53], [0, 0.53]]), bun);
  const leaf = geometry("fastfood-lettuce", () => {
    const geo = new THREE.CylinderGeometry(1.57, 1.57, 0.13, 32, 1);
    const a = geo.attributes.position;
    for (let i = 0; i < a.count; i++) {
      const x = a.getX(i), z = a.getZ(i), angle = Math.atan2(z, x), r = Math.hypot(x, z);
      const ripple = 1 + Math.sin(angle * 9) * 0.09;
      a.setXYZ(i, x * ripple, a.getY(i) + Math.sin(angle * 7) * 0.13 * r / 1.57, z * ripple);
    }
    geo.computeVertexNormals();
    return geo;
  });
  mesh(g, leaf, lettuce, [0, 0.68, 0]);
  const cheeseGeo = geometry("fastfood-folded-cheese", () => {
    const geo = new THREE.BoxGeometry(2.65, 0.09, 2.65, 2, 1, 2), a = geo.attributes.position;
    for (let i = 0; i < a.count; i++) a.setY(i, a.getY(i) - Math.max(0, Math.hypot(a.getX(i), a.getZ(i)) - 1.3) * 0.6);
    geo.computeVertexNormals();
    return geo;
  });
  const layers = variant % 2 ? 2 : 1;
  for (let i = 0; i < layers; i++) {
    const y = 0.96 + i * 0.57;
    cylinder(g, patty, [0, y, 0], [1.49, 0.36, 1.49]);
    for (let n = 0; n < 9; n++) {
      const a = n * Math.PI * 2 / 9;
      smallRound(g, toast, [Math.sin(a) * 1.48, y + 0.02, Math.cos(a) * 1.48], [0.16, 0.1, 0.12]);
    }
    mesh(g, cheeseGeo, cheese, [0, y + 0.25, 0]).rotation.y = 0.25 + i * 0.5;
  }
  const topY = 1.43 + (layers - 1) * 0.57;
  cylinder(g, tomato, [0, topY, 0], [1.34, 0.2, 1.34]);
  for (const x of [-0.6, 0.6]) {
    cylinder(g, lettuce, [x, topY + 0.18, 0.8], [0.4, 0.12, 0.4]);
    ring(g, cream, [x, topY + 0.2, -0.3], [0.5, 0.5, 0.5]).rotation.x = Math.PI / 2;
  }
  mesh(g, lathe("fastfood-bun-dome", [[0, 0], [1.48, 0], [1.6, 0.17], [1.48, 0.54], [1.12, 0.87], [0.6, 1.04], [0, 1.1]]), bun, [0, topY + 0.26, 0]);
  for (let i = 0; i < 16; i++) {
    const a = i * 2.4, r = 0.35 + (i % 4) * 0.28;
    const seed = smallRound(g, cream, [Math.sin(a) * r, topY + 1.36 - r * r * 0.3, Math.cos(a) * r], [0.055, 0.025, 0.14]);
    seed.rotation.y = a + 0.4;
  }
  g.scale.setScalar(scale);
  return g;
}

// Pizza is a thick sector with a separate sauce/cheese face and curved crust.
// The toppings sit on the upward face even when the display is tilted toward play.
export function pizza(parent, scale = 1, variant = 0) {
  const g = group(parent);
  g.name = variant % 2 ? "Pepperoni and pepper pizza slice" : "Whole topped pizza";
  const sliced = variant % 2 === 1, arc = sliced ? Math.PI / 2 : Math.PI * 2;
  const disk = geometry(`fastfood-pizza-${sliced ? "slice" : "whole"}`, () => new THREE.CylinderGeometry(2, 2, 1, 32, 1, false, -arc / 2, arc));
  mesh(g, disk, bun, [0, 0.19, 0], [1, 0.38, 1]);
  mesh(g, disk, tomato, [0, 0.39, 0], [0.94, 0.08, 0.94]);
  mesh(g, disk, cheese, [0, 0.45, 0], [0.91, 0.1, 0.91]);
  const crust = geometry(`fastfood-crust-${sliced ? "slice" : "whole"}`, () => {
    const curve = new THREE.CatmullRomCurve3(Array.from({ length: sliced ? 13 : 33 }, (_, i) => {
      const a = -arc / 2 + i * arc / (sliced ? 12 : 32);
      return new THREE.Vector3(Math.sin(a) * 1.88, 0, Math.cos(a) * 1.88);
    }));
    return new THREE.TubeGeometry(curve, sliced ? 16 : 48, 0.23, 6, false);
  });
  mesh(g, crust, toast, [0, 0.49, 0]);
  const positions = sliced
    ? [[-0.55, 1.4], [0.45, 1.35], [0, 0.65]]
    : [[-0.9, 1], [0.35, 1.2], [1.25, 0.1], [0.6, -0.95], [-0.65, -1.1], [-1.2, -0.1], [0, 0]];
  for (const [x, z] of positions) {
    cylinder(g, tomato, [x, 0.56, z], [0.32, 0.075, 0.32]);
    for (const [dx, dz] of [[-0.09, 0.1], [0.13, 0.04], [0, -0.13]]) smallRound(g, bun, [x + dx, 0.607, z + dz], [0.035, 0.015, 0.045]);
    ring(g, lettuce, [x + 0.32, 0.56, z - 0.2], [0.23, 0.23, 0.23]).rotation.x = Math.PI / 2;
  }
  // Toasted cheese spots and cut seams add material/form cues without textures.
  for (const [x, z] of positions.slice(0, 4)) smallRound(g, bun, [x - 0.24, 0.51, z + 0.28], [0.14, 0.018, 0.08]);
  if (!sliced) for (let i = 0; i < 4; i++) {
    const seam = box(g, toast, [0, 0.505, 0], [0.025, 0.015, 3.5]);
    seam.rotation.y = i * Math.PI / 4;
  }
  g.scale.setScalar(scale);
  return g;
}

export function fries(parent, scale = 1, variant = 0) {
  const g = group(parent);
  g.name = "Full open fry carton";
  // Front lip dips in the middle; the sides and back enclose a real open carton.
  const frontGeo = geometry("fastfood-carton-front", () => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.78, 0); shape.lineTo(0.78, 0); shape.lineTo(1.08, 2.1);
    shape.quadraticCurveTo(0, 1.25, -1.08, 2.1); shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false, curveSegments: 8 });
    geo.setIndex(Array.from({ length: geo.attributes.position.count }, (_, i) => i));
    return geo;
  });
  mesh(g, frontGeo, variant % 2 ? teal : tomato, [0, 0.12, 0.65]);
  box(g, cream, [0, 1.12, -0.55], [2, 2.1, 0.1]);
  for (const side of [-1, 1]) {
    box(g, variant % 2 ? teal : tomato, [side * 0.91, 1, 0], [0.1, 1.85, 1.25]).rotation.z = side * -0.13;
    box(g, cream, [side * 0.55, 0.95, 0.77], [0.1, 1.2, 0.025]);
  }
  for (let row = 0; row < 3; row++) for (let i = 0; i < 6; i++) {
    const h = 1.4 + ((i * 3 + row * 2 + variant) % 5) * 0.15;
    const fry = box(g, (i + row) % 3 ? cheese : bun, [(i - 2.5) * 0.3, 1.4 + h / 2, -0.4 + row * 0.38], [0.23, h, 0.24]);
    fry.rotation.z = (i - 2.5) * -0.045 + (row - 1) * 0.06;
    fry.rotation.x = (row - 1) * 0.09;
  }
  g.scale.setScalar(scale);
  return g;
}

export function milkshake(parent, scale = 1, variant = 0) {
  const g = group(parent), flavor = [pink, cream, patty][variant % 3];
  g.name = ["Strawberry", "Vanilla", "Chocolate"][variant % 3] + " milkshake";
  mesh(g, lathe("fastfood-shake-cup", [[0, 0], [0.55, 0], [0.63, 0.15], [0.8, 2.35], [0.85, 2.45], [0, 2.45]]), flavor);
  for (let i = 0; i < 10; i++) {
    const a = i * Math.PI * 2 / 10;
    cylinder(g, cream, [Math.sin(a) * 0.67, 0.9, Math.cos(a) * 0.67], [0.025, 1.4, 0.025]);
  }
  for (const y of [0.12, 2.38]) ring(g, metal, [0, y, 0], [y < 1 ? 0.59 : 0.83, y < 1 ? 0.59 : 0.83, 1]).rotation.x = Math.PI / 2;
  // A connected tapered cream coil, rather than a stack of floating scoops.
  mesh(g, geometry("fastfood-whipped-cream", () => {
    const points = Array.from({ length: 49 }, (_, i) => {
      const t = i / 48, a = t * Math.PI * 5.2, r = 0.53 * (1 - t);
      return new THREE.Vector3(Math.cos(a) * r, t * 0.95, Math.sin(a) * r);
    });
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 48, 0.18, 6, false);
    return geo;
  }), cream, [0, 2.47, 0]);
  const straw = group(g, [0.45, 2.2, -0.2]); straw.rotation.z = -0.18;
  cylinder(straw, cream, [0, 0.9, 0], [0.075, 1.8, 0.075]);
  for (let i = 0; i < 5; i++) cylinder(straw, tomato, [0, 0.25 + i * 0.32, 0], [0.077, 0.12, 0.077]);
  smallRound(g, tomato, [0, 3.42, 0], [0.18, 0.19, 0.18]);
  g.scale.setScalar(scale);
  return g;
}

export function mealTray(parent, scale = 1, variant = 0) {
  const g = group(parent); g.name = "Burger fries and shake meal tray";
  tray(g, 6.1, 4.2);
  burger(g, 0.82, variant).position.set(-1.25, 0.33, 0.35);
  fries(g, 0.75, variant).position.set(1.35, 0.33, -0.5);
  milkshake(g, 0.6, variant).position.set(2, 0.33, 1.1);
  const dip = group(g, [0.7, 0.33, 1.25]);
  cylinder(dip, cream, [0, 0.1, 0], [0.33, 0.2, 0.33]);
  cylinder(dip, tomato, [0, 0.21, 0], [0.28, 0.025, 0.28]);
  box(g, cream, [-1.9, 0.36, -1.35], [1.1, 0.04, 0.7]).rotation.y = 0.2;
  g.scale.setScalar(scale); return g;
}

export function pizzaBoard(parent, scale = 1, variant = 0) {
  const g = group(parent); g.name = "Pizza serving board and slice";
  tray(g, 5.5, 4.8);
  const pie = pizza(g, 0.85, 0); pie.position.set(-0.5, 0.4, -0.25);
  const slice = pizza(g, 0.95, 1); slice.position.set(1.05, 0.45, 0.65); slice.rotation.set(0.28, -0.6, -0.12);
  condiment(g, tomato, -2, 1.6, 0.65).position.y = 0.33;
  napkins(g, 1.9, 0.33, -1.6);
  g.scale.setScalar(scale); return g;
}

export function shakeCounter(parent, scale = 1, variant = 0) {
  const g = group(parent); g.name = "Three-flavor shake counter";
  box(g, teal, [0, 0.65, 0], [4.3, 1.3, 2.4]);
  box(g, cream, [0, 1.35, 0], [4.6, 0.18, 2.7]);
  for (let i = 0; i < 3; i++) milkshake(g, 0.75, (i + variant) % 3).position.set((i - 1) * 1.35, 1.44, 0);
  for (const x of [-1.3, 0, 1.3]) {
    cylinder(g, metal, [x, 0.65, 2], [0.09, 1.3, 0.09]);
    cylinder(g, tomato, [x, 1.3, 2], [0.45, 0.22, 0.45]);
  }
  for (let i = 0; i < 7; i++) box(g, i % 2 ? tomato : cream, [-1.8 + i * 0.6, 0.9, 1.22], [0.6, 0.35, 0.04]);
  g.scale.setScalar(scale); return g;
}

export function dinerBooth(parent, scale = 1, variant = 0) {
  const g = group(parent); g.name = "Picnic diner booth with complete meals";
  box(g, metal, [0, 0.06, 0], [6.5, 0.12, 5]);
  box(g, cream, [0, 1.65, 0], [4.3, 0.25, 2.3]);
  for (const x of [-1.5, 1.5]) box(g, ink, [x, 0.85, 0], [0.2, 1.6, 1.4]);
  for (const side of [-1, 1]) {
    box(g, variant % 2 ? teal : tomato, [0, 0.85, side * 1.95], [4.8, 0.35, 0.85]);
    box(g, variant % 2 ? teal : tomato, [0, 1.55, side * 2.36], [4.8, 1.3, 0.3]);
    for (const x of [-1.8, 1.8]) box(g, metal, [x, 0.45, side * 1.95], [0.15, 0.9, 0.7]);
    for (let i = 0; i < 6; i++) box(g, cream, [-1.9 + i * 0.76, 1.55, side * 2.18], [0.025, 1.05, 0.025]);
  }
  mealTray(g, 0.47, variant).position.set(-0.65, 1.8, 0);
  pizza(g, 0.48, 1).position.set(1.35, 1.8, -0.3);
  condiment(g, cheese, 1.6, 0.6, 0.45).position.y = 1.8;
  g.scale.setScalar(scale); return g;
}

function menuSign(parent, x, y, z, variant = 0) {
  box(parent, ink, [x, y, z], [1.6, 2, 0.16]);
  // Miniature actual food and three order marks, not unreadable pseudo-lettering.
  const logo = variant % 2 ? pizza(parent, 0.28, 1) : burger(parent, 0.25);
  logo.position.set(x, y + 0.15, z + 0.2); logo.rotation.x = variant % 2 ? 1 : 0;
  for (let i = 0; i < 3; i++) box(parent, cream, [x, y - 0.4 - i * 0.17, z + 0.1], [0.8 - i * 0.1, 0.045, 0.03]);
}

export function foodKiosk(parent, scale = 1, variant = 0) {
  const g = group(parent); g.name = variant % 2 ? "Pizza slice kitchen kiosk" : "Burger kitchen kiosk";
  box(g, metal, [0, 0.12, 0], [7.8, 0.24, 6.5]);
  box(g, variant % 2 ? teal : tomato, [0, 1.6, -0.7], [6.5, 3.2, 3.6]);
  box(g, ink, [0, 2.4, 1.14], [5.7, 1.2, 0.06]);
  box(g, cream, [0, 1.7, 1.5], [7, 0.2, 1.2]);
  for (const side of [-1, 1]) {
    box(g, cream, [side * 3.1, 2.8, 1.3], [0.14, 2.1, 0.14]);
    box(g, cream, [side * 3.28, 2, -0.7], [0.1, 1.7, 2.4]);
    box(g, ink, [side * 3.35, 2, -0.7], [0.06, 1.4, 2]);
    for (const z of [-1.5, 0]) box(g, metal, [side * 3.4, 2, z], [0.06, 1.4, 0.08]);
  }
  for (let i = 0; i < 8; i++) {
    box(g, i % 2 ? cream : tomato, [-3.15 + i * 0.9, 3.5, 0.3], [0.9, 0.22, 5.8]);
    box(g, i % 2 ? cream : tomato, [-3.15 + i * 0.9, 3.25, 3.1], [0.9, 0.45, 0.15]);
  }
  const roofFood = variant % 2 ? pizza(g, 1.6, 1) : burger(g, 1.25, variant);
  roofFood.position.set(0, 3.65, -0.6); roofFood.rotation.x = variant % 2 ? 0.4 : 0;
  mealTray(g, 0.44, variant).position.set(-1.65, 1.82, 1.65);
  milkshake(g, 0.6, variant).position.set(1.6, 1.82, 1.7);
  menuSign(g, 2.25, 2.45, -2.55, variant);
  for (const x of [-2.2, 0, 2.2]) {
    cylinder(g, metal, [x, 0.7, 3.8], [0.1, 1.4, 0.1]);
    cylinder(g, teal, [x, 1.4, 3.8], [0.43, 0.22, 0.43]);
  }
  g.scale.setScalar(scale); return g;
}

export function burgerDiner(parent, scale = 1, variant = 0) {
  const g = group(parent); g.name = "Round sesame-bun diner";
  cylinder(g, metal, [0, 0.15, 0], [5, 0.3, 5]);
  cylinder(g, teal, [0, 2.3, 0], [4.2, 4.3, 4.2]);
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI * 2 / 12;
    const wall = group(g, [Math.sin(a) * 4.2, 0, Math.cos(a) * 4.2]); wall.rotation.y = a;
    box(wall, cream, [0, 2.6, 0], [1.8, 2.4, 0.12]);
    box(wall, ink, [0, 2.6, 0.08], [1.5, 2.1, 0.05]);
    box(wall, metal, [0, 2.6, 0.13], [0.07, 2.1, 0.03]);
    box(wall, cream, [0, 1, 0.1], [1.8, 0.12, 0.1]);
  }
  burger(g, 2.85, variant).position.y = 4.3;
  box(g, tomato, [0, 1.7, 4.35], [1.65, 3.1, 0.2]);
  box(g, cream, [0, 2.1, 4.48], [1.1, 1.5, 0.05]);
  smallRound(g, cheese, [0.5, 1.3, 4.53], [0.08, 0.08, 0.06]);
  for (const side of [-1, 1]) {
    foodPlanter(g, 0.85).position.set(side * 3.8, 0.3, 4.3);
    menuSign(g, side * 2.5, 1.7, 4.45, variant + 1);
  }
  g.scale.setScalar(scale); return g;
}

export function foodPlanter(parent, scale = 1) {
  const g = group(parent); g.name = "Diner herb and tomato planter";
  box(g, teal, [0, 0.4, 0], [2.3, 0.8, 1.2]);
  box(g, patty, [0, 0.83, 0], [2.1, 0.05, 1]);
  for (const x of [-0.7, 0, 0.7]) {
    cylinder(g, lettuce, [x, 1.1, 0], [0.035, 0.6, 0.035]);
    smallRound(g, lettuce, [x, 1.4, 0], [0.42, 0.38, 0.4]);
    smallRound(g, tomato, [x + 0.15, 1.3, 0.3], [0.17, 0.18, 0.16]);
  }
  g.scale.setScalar(scale); return g;
}
