import * as THREE from "three";
import { group, mesh, geometry, box, cylinder, cone } from "../art/primitives.js";

// Original compact park, informed by manufacturer construction photographs.
// Fixed variants share indexed geometry; the world bakes them per spatial chunk.
const cream = "#f3e7cd", steel = "#76969c", rail = "#526e80";
const blue = "#58b9cf", aqua = "#70d5d0", coral = "#e78e79";
const yellow = "#f2cf73", green = "#79af91", sand = "#d4b79a";
const colors = [coral, blue, yellow];
const V = (a) => new THREE.Vector3(...a);
function beam(p, a, b, radius = 0.08, color = steel) {
  const start = V(a), end = V(b), d = end.clone().sub(start);
  const m = cylinder(p, color, start.add(end).multiplyScalar(0.5).toArray(), [radius, d.length(), radius]);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return m;
}
function ring(p, color, pos, r = 1, thickness = 0.13) {
  return mesh(p, geometry(`waterpark-ring-${thickness}`, () => new THREE.TorusGeometry(1, thickness, 8, 24)), color, pos, [r, r, r]);
}
const paths = [
  [[-2, 9, -6], [-2, 8.4, -4], [-5, 6.4, -1], [-3, 4.6, 2], [2, 2.3, 4.8], [2, 1.48, 8], [2, 1.48, 9]],
  [[-2, 10, -6], [-2, 9.4, -4], [3.8, 7.6, -2], [5, 5.6, 1.6], [-1, 3.6, 3.4], [-2, 1.48, 7.5], [-2, 1.48, 9]],
  [[-2, 7, -6], [-2, 6.6, -4], [-2, 4.3, 0], [-2, 3.7, 2], [-2, 1.48, 7], [-2, 1.48, 9]],
];
const curves = paths.map((p) => new THREE.CatmullRomCurve3(p.map(V), false, "catmullrom", 0.25));

// Sweep two separate concentric skins with end annuli. Open flumes also have
// solid top rims. The underside and interior have opposite outward normals;
// this is real shell thickness, not a double-sided ribbon or capped cylinder.
export function slideGeometry(variant = 0, enclosed = false) {
  variant %= 3;
  return geometry(`waterpark-slide-${variant}-${enclosed}`, () => {
    const curve = curves[variant], steps = 48, sides = enclosed ? 20 : 12;
    const angle = enclosed ? Math.PI * 2 : Math.PI;
    const pos = [], uv = [], index = [];
    const frames = Array.from({ length: steps + 1 }, (_, i) => {
      const t = i / steps, tangent = curve.getTangent(t).normalize();
      const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), tangent).normalize();
      const up = new THREE.Vector3().crossVectors(tangent, right).normalize();
      return { center: curve.getPoint(t), right, up };
    });
    for (const radius of [1.1, 1.27]) for (let i = 0; i <= steps; i++) {
      const f = frames[i];
      for (let j = 0; j <= sides; j++) {
        const a = j / sides * angle;
        const p = f.center.clone().addScaledVector(f.right, Math.cos(a) * radius).addScaledVector(f.up, -Math.sin(a) * radius);
        pos.push(p.x, p.y, p.z); uv.push(j / sides, i / steps);
      }
    }
    const stride = sides + 1, skin = (steps + 1) * stride;
    const quad = (a, b, c, d, flip = false) => index.push(...(flip ? [a, c, b, b, c, d] : [a, b, c, b, d, c]));
    for (let i = 0; i < steps; i++) for (let j = 0; j < sides; j++) {
      const a = i * stride + j;
      quad(a, a + stride, a + 1, a + stride + 1, true);
      quad(a + skin, a + skin + stride, a + skin + 1, a + skin + stride + 1);
    }
    for (const i of [0, steps]) for (let j = 0; j < sides; j++) {
      const a = i * stride + j;
      quad(a, a + 1, a + skin, a + skin + 1, i === 0);
    }
    if (!enclosed) for (const j of [0, sides]) for (let i = 0; i < steps; i++) {
      const a = i * stride + j;
      quad(a, a + skin, a + stride, a + skin + stride, j === 0);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(index); geo.computeVertexNormals();
    return geo;
  });
}
function ladder(p, x, z) {
  for (const side of [-1, 1]) {
    const xx = x + side * 0.42;
    beam(p, [xx, 0.38, z + 0.5], [xx, 1.8, z + 0.5], 0.065, rail);
    beam(p, [xx, 1.8, z + 0.5], [xx, 1.8, z - 0.45], 0.065, rail);
    beam(p, [xx, 1.8, z - 0.45], [xx, 0.15, z - 0.45], 0.065, rail);
  }
  for (let i = 0; i < 4; i++) beam(p, [x - 0.42, 0.35 + i * 0.28, z - 0.45], [x + 0.42, 0.35 + i * 0.28, z - 0.45], 0.065, rail);
}
export function receivingPool(parent, scale = 1, variant = 0) {
  const g = group(parent); g.name = "Receiving pool with coping shallow steps and ladder";
  box(g, cream, [0, 0.16, 0], [9, 0.32, 7]);
  box(g, blue, [0, 0.33, 0], [8.2, 0.18, 6.2]);
  box(g, aqua, [0, 0.44, 0], [7.8, 0.04, 5.8]);
  for (const side of [-1, 1]) {
    box(g, cream, [side * 4.25, 0.53, 0], [0.5, 0.45, 7]);
    box(g, cream, [0, 0.53, side * 3.25], [8.5, 0.45, 0.5]);
    for (let i = 0; i < 9; i++) box(g, blue, [(i - 4) * 0.88, 0.77, side * 3.25], [0.06, 0.025, 0.48]);
  }
  // Broad corner entry shelves sit above the opaque water as a shallow edge.
  for (let i = 0; i < 3; i++) box(g, i % 2 ? cream : blue, [-2.7, 0.47 + i * 0.08, 1.2 + i * 0.47], [2.1, 0.08, 0.6]);
  ladder(g, 2.7, 3.15);
  for (let i = 0; i < 4; i++) box(g, cream, [-1 + i * 0.75, 0.471, -1.4 + (i % 2) * 0.2], [0.5, 0.012, 0.07]);
  if (variant % 2) ring(g, coral, [0.8, 0.61, 0.2], 0.68, 0.25).rotation.x = Math.PI / 2;
  g.scale.setScalar(scale); return g;
}
function platform(p, height) {
  // Deck meets the flume floor; a side stair flight terminates flush with it.
  const y = height - 1.1;
  box(p, cream, [-2, y - 0.15, -7.5], [4, 0.3, 3]);
  for (const x of [-3.7, -0.3]) for (const z of [-8.7, -6.3]) {
    beam(p, [x, 0, z], [x, y + 1.3, z], 0.14);
    box(p, sand, [x, 0.12, z], [0.8, 0.24, 0.8]);
  }
  for (const z of [-8.7, -6.3]) {
    beam(p, [-3.7, 0.4, z], [-0.3, y - 0.3, z], 0.08);
    beam(p, [-0.3, 0.4, z], [-3.7, y - 0.3, z], 0.08);
  }
  for (const h of [0.65, 1.3]) {
    beam(p, [-3.8, y + h, -8.8], [0, y + h, -8.8], 0.07, rail);
    beam(p, [-3.8, y + h, -8.8], [-3.8, y + h, -6], 0.07, rail);
  }
  const steps = 18, run = 10;
  for (let i = 0; i < steps; i++) box(p, cream, [1.1, y * (i + 1) / steps - 0.09, -7.2 + run * (1 - (i + 0.5) / steps)], [2.2, 0.18, run / steps + 0.04]);
  for (const x of [0, 2.2]) {
    beam(p, [x, 0, 3], [x, y - 0.15, -7.2], 0.13);
    beam(p, [x, 1.2, 3], [x, y + 1.2, -7.2], 0.07, rail);
    for (let i = 0; i <= 6; i++) beam(p, [x, y * i / 6, 3 - i * 10.2 / 6], [x, y * i / 6 + 1.2, 3 - i * 10.2 / 6], 0.065, rail);
  }
  box(p, cream, [0.5, y - 0.15, -7.5], [1.3, 0.3, 3]);
  cone(p, colors[Math.round(height) % 3], [-2, y + 2.7, -7.5], [3.1, 1.6, 2.5]);
  for (const x of [-3.6, -0.4]) beam(p, [x, y, -8.4], [x, y + 2.3, -8.4], 0.09, rail);
}
export function slideComplex(parent, scale = 1, variant = 0) {
  variant %= 3;
  const g = group(parent); g.name = ["Curving open flume tower and receiving pool", "Enclosed spiral tube tower and receiving pool", "Twin racing troughs and receiving pool"][variant];
  const enclosed = variant === 1, curve = curves[variant];
  platform(g, paths[variant][0][1]);
  const offsets = variant === 2 ? [0, 2.7] : [0];
  for (const offset of offsets) {
    const slide = group(g, [offset, 0, 0]);
    mesh(slide, slideGeometry(variant, enclosed), colors[variant]);
    for (const t of [0.12, 0.3, 0.48, 0.66, 0.84]) {
      const p = curve.getPoint(t), tangent = curve.getTangent(t).normalize();
      // Collars follow the actual cross-section, with a visible material seam.
      const collar = mesh(slide, geometry(`waterpark-collar-${enclosed}`, () => new THREE.TorusGeometry(1.295, 0.045, 5, enclosed ? 24 : 14, enclosed ? Math.PI * 2 : Math.PI)), cream, p.toArray());
      collar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
      if (!enclosed) collar.rotateZ(Math.PI);
      const under = p.y - 1.3;
      beam(slide, [p.x, 0.12, p.z], [p.x, under, p.z], 0.16);
      box(slide, sand, [p.x, 0.12, p.z], [0.9, 0.24, 0.9]);
      beam(slide, [p.x - 1.3, under, p.z], [p.x + 1.3, under, p.z], 0.12);
      if (under > 2) beam(slide, [p.x, under - 1.4, p.z], [p.x + 1.2, under, p.z], 0.09);
    }
  }
  receivingPool(g, 1, 0).position.set(variant === 0 ? 2 : variant === 1 ? -2 : -0.65, 0, 11.4);
  g.scale.setScalar(scale); return g;
}

export function floatRack(parent, scale = 1, variant = 0) {
  const g = group(parent); g.name = "Inflatable rings and towel rack";
  box(g, cream, [0, 0.08, 0], [3.6, 0.16, 2.5]);
  for (const x of [-1.3, 1.3]) beam(g, [x, 0, 0], [x, 2.7, 0], 0.09, rail);
  beam(g, [-1.3, 2.55, 0], [1.3, 2.55, 0], 0.09, rail);
  for (let i = 0; i < 3; i++) {
    ring(g, colors[(i + variant) % 3], [(i - 1) * 0.92, 1.5, 0.15], 0.63, 0.28);
    box(g, i % 2 ? aqua : cream, [(i - 1) * 0.95, 0.45, 0.9], [0.78, 0.23, 0.58]);
  }
  g.scale.setScalar(scale); return g;
}
export function loungeSet(parent, scale = 1, variant = 0) {
  const g = group(parent); g.name = "Striped umbrella loungers and drinks table";
  for (const x of [-1.7, 1.7]) {
    for (const z of [-0.6, 1.2]) for (const dx of [-0.6, 0.6]) beam(g, [x + dx, 0, z], [x + dx, 0.65, z + 0.15], 0.07);
    box(g, cream, [x, 0.68, 0.6], [1.5, 0.16, 2.4]);
    const back = box(g, colors[variant % 3], [x, 1.23, -0.92], [1.5, 0.13, 1.6]); back.rotation.x = 0.75;
    for (const dx of [-0.45, 0, 0.45]) box(g, colors[variant % 3], [x + dx, 0.77, 0.6], [0.19, 0.03, 2.35]);
  }
  cylinder(g, steel, [0, 1.8, -1.6], [0.08, 3.6, 0.08]);
  for (let i = 0; i < 8; i++) {
    const panel = mesh(g, geometry("waterpark-umbrella-panel", () => new THREE.ConeGeometry(2.8, 1.1, 2, 1, true, 0, Math.PI / 4)), i % 2 ? cream : colors[variant % 3], [0, 3.7, -1.6]); panel.rotation.y = i * Math.PI / 4;
  }
  cylinder(g, cream, [0, 0.95, 0.6], [0.7, 0.16, 0.7]);
  cylinder(g, steel, [0, 0.48, 0.6], [0.1, 0.9, 0.1]);
  for (const x of [-0.25, 0.25]) { cylinder(g, colors[variant % 3], [x, 1.2, 0.6], [0.15, 0.35, 0.15]); beam(g, [x, 1.3, 0.6], [x + 0.08, 1.65, 0.6], 0.025, cream); }
  g.scale.setScalar(scale); return g;
}
export function deckPlanter(parent, scale = 1) {
  const g = group(parent); g.name = "Poolside tropical planter";
  cylinder(g, cream, [0, 0.35, 0], [0.9, 0.7, 0.9]);
  cylinder(g, sand, [0, 0.72, 0], [0.78, 0.04, 0.78]);
  for (let i = 0; i < 7; i++) {
    const a = i * Math.PI * 2 / 7;
    const leaf = mesh(g, geometry("waterpark-leaf", () => new THREE.SphereGeometry(1, 8, 5)), green, [Math.sin(a) * 0.5, 1.35, Math.cos(a) * 0.5], [0.23, 0.9, 0.13]);
    leaf.rotation.set(Math.cos(a) * 0.7, 0, -Math.sin(a) * 0.7);
  }
  g.scale.setScalar(scale); return g;
}
export function splashPlay(parent, scale = 1, variant = 0) {
  const g = group(parent); g.name = "Shallow splash-play pool with bucket and water wheels";
  receivingPool(g, 1.05, 1);
  for (const x of [-2, 2]) for (const z of [-1.5, 1.5]) beam(g, [x, 0.3, z], [x, 4.8, z], 0.12, colors[variant % 3]);
  box(g, cream, [0, 2.2, -0.3], [4.3, 0.25, 2.7]);
  for (const x of [-2, 2]) {
    beam(g, [x, 3.3, -1.5], [x, 3.3, 1], 0.07, rail);
    for (let i = 0; i < 5; i++) beam(g, [x, 2.3, -1.5 + i * 0.6], [x, 3.3, -1.5 + i * 0.6], 0.05, rail);
  }
  beam(g, [-2, 4.8, -1], [2, 4.8, -1], 0.13);
  const bucket = mesh(g, geometry("waterpark-open-bucket", () => new THREE.LatheGeometry([[0, 0], [0.55, 0], [0.85, 1.3], [0.74, 1.3], [0.46, 0.13], [0, 0.13]].map(([x,y]) => new THREE.Vector2(x,y)), 16)), yellow, [0, 4, -1]); bucket.rotation.x = -0.35;
  ring(g, coral, [0, 3.1, 1.13], 0.55, 0.1);
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; beam(g, [0, 3.1, 1.13], [Math.sin(a) * 0.55, 3.1 + Math.cos(a) * 0.55, 1.13], 0.055, coral); }
  // A connected access ladder and short, thick nursery slide meet the play deck.
  for (const x of [-0.5, 0.5]) beam(g, [x, 0.4, 2.7], [x, 2.4, 0.9], 0.07, rail);
  for (let i = 0; i < 6; i++) beam(g, [-0.5, 0.5 + i * 0.34, 2.6 - i * 0.3], [0.5, 0.5 + i * 0.34, 2.6 - i * 0.3], 0.07, rail);
  const mini = group(g, [-1.3, 0.2, 0.4]); mini.scale.set(0.36, 0.34, 0.27);
  mesh(mini, slideGeometry(2, false), blue);
  g.scale.setScalar(scale); return g;
}
