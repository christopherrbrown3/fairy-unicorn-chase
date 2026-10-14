import * as THREE from "three";
import {
  cone,
  cylinder,
  box,
  group,
  star,
  mesh,
  geometry,
  bake,
  tube,
} from "../art/primitives.js";
// Scenery uses fewer rings than close-up characters and is baked into spatial chunks.
const orb = (p, c, pos, scale = [1, 1, 1], extra = {}) =>
  mesh(
    p,
    geometry("scenery-orb", () => new THREE.SphereGeometry(1, 12, 8)),
    c,
    pos,
    scale,
    extra,
  );
export function tree(parent, color = "#70af88", scale = 1) {
  const g = group(parent);
  const bark = "#a97e65";
  mesh(
    g,
    geometry(
      "tree-trunk",
      () => new THREE.CylinderGeometry(0.16, 0.34, 3.2, 9),
    ),
    bark,
    [0, 1.6, 0],
  );
  for (const side of [-1, 1]) {
    const branch = cylinder(
      g,
      bark,
      [side * 0.36, 2.05, 0.04],
      [0.1, 1.3, 0.1],
    );
    branch.rotation.z = -side * 0.6;
    orb(g, bark, [side * 0.22, 0.13, 0.1], [0.46, 0.16, 0.23]);
  }
  const shades = [0, -0.04, 0.035, 0.065, -0.02];
  const clumps = [
    [0, 3.25, 0, 1.3],
    [-0.88, 2.85, 0.12, 0.93],
    [0.82, 3.04, 0.18, 1.05],
    [-0.27, 4.12, -0.12, 0.86],
    [0.27, 3.1, -0.78, 0.93],
  ];
  clumps.forEach(([x, y, z, r], i) => {
    const tone = new THREE.Color(color).offsetHSL(0, 0, shades[i]).getStyle();
    orb(g, tone, [x, y, z], [r, r * 0.92, r]);
    for (let n = 0; n < 4; n++) {
      const a = n * 2.4 + i;
      mesh(
        g,
        geometry("leaf-lobe", () => new THREE.SphereGeometry(1, 8, 6)),
        tone,
        [
          x + Math.cos(a) * r * 0.72,
          y + r * 0.32 + Math.sin(a) * r * 0.35,
          z + Math.sin(a) * r * 0.6,
        ],
        [r * 0.47, r * 0.46, r * 0.45],
      );
    }
  });
  g.scale.setScalar(scale);
  return g;
}
export function mushroom(parent, color = "#e993ad", scale = 1) {
  const g = group(parent);
  cylinder(g, "#fff1d7", [0, 0.55, 0], [0.22, 1.1, 0.22]);
  orb(g, color, [0, 1.2, 0], [0.8, 0.4, 0.8]);
  orb(g, "#ead2bd", [0, 1.08, 0], [0.71, 0.11, 0.71]);
  for (const [x, z] of [
    [0, 0],
    [0.4, 0.25],
    [-0.3, 0.2],
  ])
    orb(g, "#fff6e9", [x, 1.5, z], [0.13, 0.04, 0.13]);
  g.scale.setScalar(scale);
  return g;
}
export function flower(parent, color = "#f4a7bd", scale = 1) {
  const g = group(parent);
  cylinder(g, "#639779", [0, 0.42, 0], [0.035, 0.85, 0.035]);
  const leaf = orb(g, "#73b687", [0.15, 0.26, 0], [0.2, 0.065, 0.09]);
  leaf.rotation.z = 0.35;
  const leaf2 = orb(g, "#5f9b7c", [-0.12, 0.43, 0.01], [0.15, 0.05, 0.075]);
  leaf2.rotation.z = -0.4;
  const petalGeo = geometry("cupped-flower-petal", () => {
    const geo = new THREE.SphereGeometry(1, 10, 8);
    const p = geo.attributes.position,
      colors = [];
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i),
        t = (y + 1) / 2;
      p.setXYZ(
        i,
        p.getX(i) * (0.68 + t * 0.32),
        y,
        p.getZ(i) * 0.28 + y * y * 0.3,
      );
      const shade = 0.72 + t * 0.28;
      colors.push(shade, shade, shade);
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  });
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8;
    const petal = mesh(
      g,
      petalGeo,
      color,
      [Math.sin(a) * 0.18, 0.93 + Math.cos(a) * 0.18, 0],
      [0.115, 0.235, 0.16],
      { vertexColors: true, roughness: 0.8 },
    );
    petal.rotation.z = -a;
  }
  orb(g, "#d9973e", [0, 0.93, 0.045], [0.13, 0.13, 0.055]);
  orb(g, "#ffdb77", [0, 0.93, 0.08], [0.1, 0.1, 0.065]);
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    orb(
      g,
      "#ffecc1",
      [Math.sin(a) * 0.065, 0.93 + Math.cos(a) * 0.065, 0.13],
      [0.018, 0.018, 0.013],
    );
  }
  orb(g, "#ffecc1", [-0.024, 0.968, 0.145], [0.042, 0.034, 0.016]);
  g.scale.setScalar(scale);
  return g;
}
export function cloud(parent, scale = 1) {
  const g = group(parent);
  for (const [x, y, z, r] of [
    [0, 0, 0, 1.8],
    [-1.5, -0.15, 0, 1.2],
    [1.5, -0.2, 0.3, 1.3],
    [0.4, 0.65, 0, 1.25],
  ])
    orb(g, "#f5faff", [x, y, z], [r, r * 0.62, r * 0.9]);
  g.scale.setScalar(scale);
  return g;
}
export function crystal(parent, color = "#9cabea", scale = 1) {
  const g = group(parent);
  const geo = geometry("quartz", () => {
    const points = [
      new THREE.Vector2(0, -0.5),
      new THREE.Vector2(0.8, -0.35),
      new THREE.Vector2(1, 0.3),
      new THREE.Vector2(0, 0.65),
    ];
    return new THREE.LatheGeometry(points, 6);
  });
  for (let i = 0; i < 4; i++) {
    const tone = new THREE.Color(color)
      .offsetHSL(0, 0, (i - 1) * 0.025)
      .getStyle();
    const c = mesh(
      g,
      geo,
      tone,
      [(i - 1.5) * 0.44, 1.1 - i * 0.12, Math.sin(i * 2) * 0.2],
      [0.44, 2.3 - i * 0.22, 0.44],
      {
        emissive: color,
        emissiveIntensity: 0.22,
        roughness: 0.22,
        metalness: 0.24,
        flatShading: true,
      },
    );
    c.rotation.z = (i - 1.5) * -0.17;
  }
  orb(g, "#837caa", [0, 0.13, 0], [1.0, 0.2, 0.6]);
  g.scale.setScalar(scale);
  return g;
}
function archedWindow(parent, x, y, z, scale = 1) {
  const geo = geometry("arched-window", () => {
    const s = new THREE.Shape();
    s.moveTo(-0.22, 0);
    s.lineTo(0.22, 0);
    s.lineTo(0.22, 0.52);
    s.absarc(0, 0.52, 0.22, 0, Math.PI, false);
    s.closePath();
    return new THREE.ShapeGeometry(s, 12);
  });
  mesh(parent, geo, "#759dbd", [x, y, z], [scale, scale, 1]);
  box(
    parent,
    "#ffdfb0",
    [x, y + 0.3 * scale, z + 0.015],
    [0.035 * scale, 0.58 * scale, 0.025],
  );
  box(
    parent,
    "#fff0d8",
    [x, y - 0.025 * scale, z + 0.02],
    [0.56 * scale, 0.09 * scale, 0.12],
  );
}
export function castle(parent, color = "#bea9d5", scale = 1, palace = false) {
  const g = group(parent);
  box(g, palace ? "#fff0de" : "#eddee1", [0, 2, 0], [5, 4, 2.8]);
  for (const x of [-2.7, 2.7]) {
    cylinder(g, "#f0e3e7", [x, 2.4, 0], [0.8, 4.8, 0.8]);
    cone(g, palace ? "#edc67b" : color, [x, 5.7, 0], [1, 2, 1]);
    cylinder(g, "#e7c06f", [x, 7.05, 0], [0.04, 1, 0.04]);
    const flag = box(g, "#e78fae", [x + 0.35, 7.4, 0], [0.65, 0.38, 0.04]);
    flag.rotation.z = -0.12;
    for (const y of [1.1, 2.8]) archedWindow(g, x, y, 0.805);
    for (const y of [0.3, 4.55])
      cylinder(g, "#e1c9d2", [x, y, 0], [0.86, 0.16, 0.86]);
  }
  box(g, "#c8a9b7", [0, 0.3, 1.7], [2.1, 0.25, 1.1]);
  box(g, "#ddc3ce", [0, 0.1, 2.1], [2.6, 0.18, 1.1]);
  box(g, "#708ca8", [0, 1, 1.42], [1.35, 2, 0.04]);
  orb(g, "#708ca8", [0, 2, 1.43], [0.675, 0.675, 0.05]);
  mesh(
    g,
    geometry(
      "castle-door-arch",
      () => new THREE.TorusGeometry(0.76, 0.09, 6, 20, Math.PI),
    ),
    "#fff0d4",
    [0, 2, 1.49],
  );
  for (const x of [-0.76, 0.76])
    box(g, "#fff0d4", [x, 1.0, 1.49], [0.18, 2, 0.13]);
  for (const x of [-1.7, 1.7]) archedWindow(g, x, 2.4, 1.43, 1.2);
  for (let i = -3; i <= 3; i++)
    box(g, "#f8edf0", [i * 0.69, 4.15, 1.15], [0.4, 0.5, 0.55]);
  box(g, "#d8bfce", [0, 3.85, 1.43], [5, 0.13, 0.16]);
  box(g, "#e391b6", [0, 3.37, 1.47], [0.5, 0.7, 0.035]);
  star(g, "#ffe9ac", [0, 3.4, 1.5], 0.15);

  if (palace) {
    cylinder(g, "#fff3dc", [0, 4, 0], [1.3, 2, 1.3]);
    orb(g, "#e7c378", [0, 5.5, 0], [1.5, 1.5, 1.5]);
    star(g, "#fff1a4", [0, 7.3, 0], 0.4);
  }
  g.scale.setScalar(scale);
  return g;
}
export function rainbow(parent, scale = 1) {
  const g = group(parent);
  ["#f09da9", "#ffc98b", "#ffe3a0", "#98d5b4", "#90cbe5", "#b4a2d8"].forEach(
    (c, i) => {
      mesh(
        g,
        geometry(
          `rainbow${i}`,
          () => new THREE.TorusGeometry(9 - i * 0.46, 0.25, 6, 48, Math.PI),
        ),
        c,
      );
    },
  );
  g.scale.setScalar(scale);
  cloud(g, 0.75).position.set(-8, -0.2, 0);
  cloud(g, 0.75).position.set(8, -0.2, 0);
  return g;
}
export function candy(parent, color, scale = 1) {
  const g = group(parent);
  cylinder(g, "#ffefdf", [0, 1.6, 0], [0.12, 3.2, 0.12]);
  orb(g, color, [0, 3.3, 0], [1.1, 1.1, 0.22]);
  mesh(
    g,
    geometry("candy-ring", () => new THREE.TorusGeometry(0.64, 0.15, 7, 20)),
    "#fff3e4",
    [0, 3.3, 0.2],
  );
  g.scale.setScalar(scale);
  return g;
}
export function potion() {
  const g = group();
  g.name = "Sparkly potion";
  orb(g, "#8be3e2", [0, 0.58, 0], [0.33, 0.43, 0.33], {
    metalness: 0.15,
    roughness: 0.22,
  });
  orb(g, "#62c8d5", [0, 0.48, 0], [0.28, 0.28, 0.28], {
    emissive: "#50aabb",
    emissiveIntensity: 0.22,
  });
  cylinder(g, "#a8eee4", [0, 0.96, 0], [0.14, 0.24, 0.14]);
  cylinder(g, "#dcb47e", [0, 1.12, 0], [0.135, 0.12, 0.135]);
  cylinder(g, "#efca78", [0, 0.89, 0], [0.18, 0.09, 0.18]);
  star(g, "#fff3b0", [0, 0.61, 0.329], 0.13);
  for (let i = 0; i < 3; i++)
    star(
      g,
      "#fff6c1",
      [Math.sin(i * 2) * 0.55, 0.9 + i * 0.25, Math.cos(i * 2) * 0.25],
      0.07,
    );
  bake(g);
  return g;
}
export function obstacle(parent, kind) {
  const g = group(parent);
  if (kind === "puddle") {
    orb(g, "#6fbcd6", [0, 0.03, 0], [1.5, 0.035, 1]);
    mesh(
      g,
      geometry("ripple", () => new THREE.TorusGeometry(0.75, 0.025, 5, 24)),
      "#c8f2fa",
      [0, 0.07, 0],
    ).rotation.x = -Math.PI / 2;
  } else if (kind === "log") {
    const l = cylinder(g, "#c39d7c", [0, 0.28, 0], [0.27, 2.2, 0.27]);
    l.rotation.z = Math.PI / 2;
    for (const x of [-1.1, 1.1]) {
      const end = cylinder(g, "#e8cbb0", [x, 0.28, 0], [0.22, 0.03, 0.22]);
      end.rotation.z = Math.PI / 2;
    }
  } else if (kind === "crystal") crystal(g, "#b0a0ed", 0.8);
  else tree(g, "#82b58c", 0.65);
  return g;
}
