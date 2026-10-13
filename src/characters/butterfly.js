import * as THREE from "three";
import { group, mesh, geometry, orb, tube, bake } from "../art/primitives.js";

const PALETTES = [
  ["#ee91b7", "#815598", "#fff1c8"],
  ["#f4c365", "#8c5365", "#fff6d3"],
  ["#93d7ec", "#565ca5", "#e9fbef"],
  ["#be9ee9", "#634b93", "#ffe4b5"],
];

function wingShape() {
  const s = new THREE.Shape();
  s.moveTo(0.035, 0.04);
  s.bezierCurveTo(0.13, 0.58, 0.59, 1.02, 1.0, 0.94);
  s.bezierCurveTo(1.15, 0.8, 1.04, 0.6, 0.95, 0.47);
  s.bezierCurveTo(1.0, 0.33, 0.83, 0.21, 0.66, 0.09);
  s.bezierCurveTo(0.92, -0.03, 0.94, -0.31, 0.77, -0.45);
  s.bezierCurveTo(0.73, -0.51, 0.63, -0.5, 0.59, -0.49);
  s.bezierCurveTo(0.56, -0.61, 0.44, -0.61, 0.38, -0.55);
  s.bezierCurveTo(0.19, -0.59, 0.12, -0.3, 0.035, 0.04);
  return s;
}

// Real upper/lower wing contours, marginal spots and radial veins; all original geometry.
export function makeButterfly(parent, variant = 0) {
  const root = group(parent);
  root.name = "Garden butterfly";
  const [color, ink, cream] = PALETTES[variant % PALETTES.length];
  const body = group(root);
  orb(body, ink, [0, 0, 0], [0.065, 0.07, 0.34]);
  orb(body, ink, [0, 0.01, 0.31], [0.095, 0.085, 0.1]);
  for (const side of [-1, 1]) {
    orb(body, cream, [side * 0.068, 0.065, 0.35], [0.024, 0.025, 0.027]);
    tube(
      body,
      ink,
      [
        [side * 0.04, 0.04, 0.37],
        [side * 0.12, 0.12, 0.56],
        [side * 0.2, 0.17, 0.61],
      ],
      0.012,
    );
    orb(body, cream, [side * 0.2, 0.17, 0.61], [0.025, 0.025, 0.025]);
  }
  bake(body);
  const shape = wingShape();
  const geo = geometry("scalloped-butterfly-wing", () => {
    const g = new THREE.ShapeGeometry(shape, 18),
      colors = [];
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i);
      const c = new THREE.Color("#c5b0df").lerp(
        new THREE.Color("#fff7d3"),
        THREE.MathUtils.clamp((y + 0.6) / 1.55, 0, 1),
      );
      c.multiplyScalar(0.82 + Math.min(x, 1) * 0.18);
      colors.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return g;
  });
  const wings = [];
  for (const side of [-1, 1]) {
    const hinge = group(root, [side * 0.04, 0, 0]);
    const art = group(hinge);
    art.rotation.x = Math.PI / 2;
    art.scale.x = side;
    mesh(art, geo, ink, [0, 0, 0], [1, 1, 1], {
      side: THREE.DoubleSide,
      roughness: 0.75,
    });
    mesh(art, geo, color, [0.015, 0.018, -0.008], [0.91, 0.91, 1], {
      side: THREE.DoubleSide,
      vertexColors: true,
      roughness: 0.5,
    });
    // Match the same visible pattern on both faces when the wings close.
    mesh(art, geo, color, [0.015, 0.018, 0.008], [0.91, 0.91, 1], {
      side: THREE.DoubleSide,
      vertexColors: true,
      roughness: 0.5,
    });
    for (const points of [
      [
        [0.05, 0.05],
        [0.35, 0.42],
        [0.95, 0.86],
      ],
      [
        [0.24, 0.3],
        [0.4, 0.59],
        [0.57, 0.87],
      ],
      [
        [0.38, 0.44],
        [0.65, 0.47],
        [0.93, 0.45],
      ],
      [
        [0.25, 0.25],
        [0.56, 0.24],
        [0.77, 0.18],
      ],
      [
        [0.05, 0.015],
        [0.33, -0.18],
        [0.72, -0.39],
      ],
      [
        [0.2, -0.12],
        [0.3, -0.3],
        [0.4, -0.5],
      ],
    ])
      tube(
        art,
        ink,
        points.map(([x, y]) => [x, y, 0]),
        0.012,
      );
    for (const [x, y, size] of [
      [0.85, 0.83, 0.028],
      [0.96, 0.69, 0.026],
      [0.93, 0.54, 0.025],
      [0.85, 0.35, 0.026],
      [0.72, 0.22, 0.022],
      [0.8, -0.18, 0.026],
      [0.72, -0.37, 0.03],
      [0.59, -0.43, 0.025],
      [0.44, -0.49, 0.024],
    ])
      orb(art, cream, [x, y, 0], [size, size, 0.017]);
    // Paired eyespots on the lower wings are legible while flying past.
    orb(art, ink, [0.53, -0.23, 0], [0.13, 0.15, 0.018]);
    orb(art, cream, [0.53, -0.23, 0], [0.084, 0.099, 0.024]);
    orb(art, color, [0.53, -0.23, 0], [0.05, 0.066, 0.03]);
    bake(art);
    // Camber the whole painted wing together, so markings follow its surface.
    art.children.forEach((part) => {
      if (!part.isMesh) return;
      const positions = part.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i),
          y = positions.getY(i);
        positions.setZ(
          i,
          positions.getZ(i) + Math.sin(x * Math.PI) * 0.09 + y * y * 0.025,
        );
      }
      part.geometry.computeVertexNormals();
      part.geometry.computeBoundingSphere();
    });
    wings.push(hinge);
  }
  root.userData.wings = wings;
  return root;
}

export function animateButterfly(butterfly, time, phase = 0) {
  const beat = Math.sin(time * 8.5 + phase);
  butterfly.userData.wings.forEach((wing, i) => {
    wing.rotation.z = (i ? 1 : -1) * (0.3 + beat * 0.9);
    wing.rotation.y = (i ? 1 : -1) * Math.sin(time * 8.5 + phase + 0.6) * 0.09;
  });
  butterfly.rotation.z = Math.sin(time * 1.7 + phase) * 0.12;
  butterfly.rotation.x = Math.sin(time * 1.3 + phase) * 0.1;
}
