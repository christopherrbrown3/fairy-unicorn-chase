import * as THREE from "three";
import { CHARACTER, MANES } from "../config/levels.js";
import {
  orb,
  cone,
  cylinder,
  mesh,
  group,
  tube,
  lock,
  star,
  bake,
  geometry,
} from "../art/primitives.js";

function tint(color, lightness) {
  return new THREE.Color(color).offsetHSL(0, 0, lightness).getStyle();
}
function hairColor(hair, i) {
  return hair === "rainbow"
    ? ["#ef8cac", "#ffd26e", "#8ad0a4", "#79caf0", "#b095df"][i % 5]
    : tint(hair, [0, 0.055, -0.035, 0.025, -0.015][i % 5]);
}
export function makePony({
  unicorn = false,
  hair = CHARACTER.hair,
  coat = CHARACTER.coat,
} = {}) {
  const root = group();
  root.name = unicorn ? "White unicorn" : "Glender";
  const body = group(root);
  const hoof = unicorn ? "#bd9fc4" : "#ab7863",
    muzzle = unicorn ? "#f7d8df" : "#f3c8a9";
  orb(body, coat, [0, 1.38, 0], [0.58, 0.64, 1]);
  const neck = orb(body, coat, [0, 1.82, 0.6], [0.43, 0.77, 0.48]);
  neck.rotation.x = 0.15;
  orb(body, tint(coat, 0.065), [0, 1.1, 0.56], [0.4, 0.39, 0.43]);
  const head = group(body, [0, 2.22, 0.94]);
  head.rotation.x = -0.15;
  orb(head, coat, [0, 0.14, 0], [0.42, 0.48, 0.59]);
  orb(head, muzzle, [0, -0.05, 0.5], [0.39, 0.26, 0.31]);
  for (const side of [-1, 1]) {
    const ear = orb(
      head,
      coat,
      [side * 0.27, 0.58, -0.13],
      [0.115, 0.32, 0.16],
    );
    ear.rotation.z = -side * 0.28;
    orb(head, muzzle, [side * 0.272, 0.62, -0.022], [0.06, 0.2, 0.047]);
    orb(head, "#fff9f4", [side * 0.364, 0.24, 0.25], [0.056, 0.145, 0.13]);
    orb(
      head,
      unicorn ? "#614b8f" : "#45566f",
      [side * 0.409, 0.23, 0.275],
      [0.038, 0.113, 0.087],
      {
        roughness: 0.18,
      },
    );
    orb(head, "#233148", [side * 0.436, 0.23, 0.285], [0.016, 0.078, 0.053]);
    orb(head, "#ffffff", [side * 0.451, 0.274, 0.304], [0.013, 0.031, 0.022]);
    orb(head, "#ffffff", [side * 0.45, 0.2, 0.267], [0.012, 0.014, 0.012]);
    orb(head, "#db9ca5", [side * 0.36, 0.035, 0.42], [0.038, 0.07, 0.1]);
    orb(head, "#976f81", [side * 0.19, -0.017, 0.752], [0.044, 0.029, 0.018]);
  }
  tube(
    head,
    "#ac7183",
    [
      [-0.12, -0.17, 0.74],
      [0, -0.2, 0.78],
      [0.12, -0.17, 0.74],
    ],
    0.012,
  );
  const mane = group(body);
  for (let i = 0; i < 7; i++) {
    const z = 0.88 - i * 0.13,
      y = 2.61 - i * 0.105;
    lock(
      mane,
      hairColor(hair, i),
      [
        [-0.05, y, z],
        [0.25, y + 0.03, z - 0.12],
        [0.38, y - 0.24, z - 0.28],
        [0.31, y - 0.53, z - 0.45],
        [0.43, y - 0.61, z - 0.57],
      ],
      0.125,
    );
  }
  for (let i = 0; i < 4; i++)
    lock(
      mane,
      hairColor(hair, i),
      [
        [0.04 * (i - 1), 2.72, 0.76],
        [0.15 * (i - 1), 2.81, 1.04],
        [0.19 * (i - 1), 2.61, 1.32],
        [0.16 * (i - 1) - 0.1, 2.4 + i * 0.025, 1.35],
      ],
      0.105,
    );
  if (unicorn) {
    const horn = cone(head, "#ffde8a", [0, 0.78, 0.22], [0.105, 0.68, 0.105]);
    horn.rotation.x = 0.12;
    for (let i = 0; i < 3; i++)
      cylinder(
        head,
        "#eeb966",
        [0, 0.56 + i * 0.14, 0.2],
        [0.105 - i * 0.022, 0.028, 0.105 - i * 0.022],
      );
  } else
    for (const side of [-1, 1])
      for (const [z, y, size] of [
        [-0.35, 1.55, 0.17],
        [0.12, 1.35, 0.13],
        [-0.66, 1.24, 0.11],
      ]) {
        const s = star(body, "#ffdc7b", [side * 0.56, y, z], size);
        s.rotation.y = (side * Math.PI) / 2;
      }
  const legs = [];
  for (const side of [-1, 1])
    for (const z of [-0.59, 0.61]) {
      const leg = group(root, [side * 0.36, 1.35, z]);
      cylinder(leg, coat, [0, -0.43, 0], [0.14, 0.86, 0.14]);
      orb(leg, coat, [0, -0.72, 0.02], [0.145, 0.2, 0.155]);
      cylinder(leg, coat, [0, -0.89, 0.035], [0.12, 0.34, 0.12]);
      cylinder(leg, tint(coat, 0.08), [0, -1.035, 0.045], [0.13, 0.14, 0.13]);
      orb(leg, hoof, [0, -1.13, 0.09], [0.19, 0.15, 0.26], { roughness: 0.42 });
      bake(leg);
      legs.push(leg);
    }
  const tail = group(root, [0, 1.66, -0.85]);
  for (let i = 0; i < 7; i++)
    lock(
      tail,
      hairColor(hair, i),
      [
        [0.045 * (i - 3), 0.05, 0],
        [0.07 * (i - 3), 0.12, -0.38],
        [0.1 * (i - 3) + 0.07, -0.22, -0.78],
        [0.075 * (i - 3) + 0.12, -0.69, -1.03],
        [0.04 * (i - 3) + 0.27, -0.92, -0.98],
      ],
      0.11,
    );
  bake(tail);
  if (!unicorn) {
    orb(body, "#f6d489", [0, 1.85, -0.13], [0.57, 0.17, 0.63]);
    orb(body, "#6488bf", [0, 1.9, -0.13], [0.53, 0.13, 0.59]);
    tube(
      body,
      "#d0a572",
      [
        [0.28, 2.22, 1.3],
        [0.6, 1.95, 0.8],
        [0.35, 2.1, -0.15],
      ],
      0.025,
    );
    tube(
      body,
      "#d0a572",
      [
        [-0.28, 2.22, 1.3],
        [-0.6, 1.95, 0.8],
        [-0.35, 2.1, -0.15],
      ],
      0.025,
    );
  }
  bake(body);
  root.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  root.userData = { body, legs, tail, head, unicorn };
  return root;
}

export function makeMia() {
  const root = group();
  root.name = "Mia";
  const c = CHARACTER;
  const body = group(root, [0, 2.05, -0.08]);
  orb(body, c.dress, [0, 0.45, 0], [0.29, 0.43, 0.22]);
  const skirtGeo = geometry("petal-skirt", () => {
    const points = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      points.push(new THREE.Vector2(0.26 + 0.34 * t, 0.26 - 0.5 * t));
    }
    const geo = new THREE.LatheGeometry(points, 36);
    const positions = geo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i),
        z = positions.getZ(i),
        y = positions.getY(i);
      const a = Math.atan2(x, z),
        hem = (0.26 - y) / 0.5;
      const fold = 1 + Math.cos(a * 8) * 0.045 * hem;
      positions.setXYZ(
        i,
        x * fold,
        y + Math.cos(a * 8) * 0.045 * hem,
        z * fold,
      );
    }
    geo.computeVertexNormals();
    return geo;
  });
  mesh(body, skirtGeo, c.dress, [0, 0.18, 0], [1, 1, 1], {
    side: THREE.DoubleSide,
  });
  cylinder(body, "#f4dba1", [0, 0.39, 0], [0.28, 0.055, 0.23]);
  star(body, "#fff1c0", [0, 0.6, 0.213], 0.09);
  for (const side of [-1, 1]) {
    orb(body, c.skin, [side * 0.49, -0.15, 0.28], [0.12, 0.32, 0.14]);
    orb(body, "#527bbe", [side * 0.49, -0.43, 0.35], [0.14, 0.13, 0.22]);
    const arm = group(body, [side * 0.27, 0.58, 0.04]);
    arm.rotation.z = side * 0.25;
    orb(arm, c.dress, [side * 0.05, -0.08, 0.05], [0.13, 0.19, 0.14]);
    orb(arm, c.skin, [side * 0.09, -0.23, 0.12], [0.075, 0.21, 0.085]);
    orb(arm, c.skin, [side * 0.12, -0.36, 0.24], [0.09, 0.085, 0.11]);
    if (side === 1) root.userData.arm = arm;
  }
  const head = group(body, [0, 1.05, 0]);
  orb(head, c.skin, [0, 0.1, 0], [0.38, 0.43, 0.33]);
  orb(head, c.hair, [0, 0.23, -0.1], [0.405, 0.4, 0.32]);
  for (const side of [-1, 1]) {
    orb(head, "#325174", [side * 0.135, 0.16, 0.305], [0.043, 0.07, 0.025]);
    orb(head, "#ffffff", [side * 0.14, 0.18, 0.328], [0.014, 0.02, 0.009]);
    orb(head, "#efa5aa", [side * 0.245, 0.017, 0.269], [0.075, 0.045, 0.025]);
    orb(head, c.hair, [side * 0.285, -0.12, -0.075], [0.16, 0.4, 0.17]);
    const hairLock = lock(
      head,
      c.hair,
      [
        [side * 0.28, 0.17, -0.18],
        [side * 0.35, -0.16, -0.24],
        [side * 0.27, -0.52, -0.38],
        [side * 0.43, -0.64, -0.49],
      ],
      0.095,
    );
    hairLock.name = "Flowing blonde lock";
  }
  tube(
    head,
    "#b27b84",
    [
      [-0.075, -0.09, 0.302],
      [0, -0.12, 0.326],
      [0.075, -0.09, 0.302],
    ],
    0.012,
  );
  for (let i = 0; i < 4; i++) {
    const fringe = orb(
      head,
      c.hair,
      [(i - 1.5) * 0.13, 0.38, 0.23],
      [0.125, 0.14, 0.1],
    );
    fringe.rotation.z = (i - 1.5) * 0.2;
  }
  for (let i = 0; i < 5; i++) {
    const a = (i - 2) * 0.35;
    orb(
      head,
      "#faf4d5",
      [Math.sin(a) * 0.36, 0.44, Math.cos(a) * 0.26],
      [0.055, 0.055, 0.05],
    );
    orb(
      head,
      "#ecafd3",
      [Math.sin(a) * 0.36, 0.465, Math.cos(a) * 0.27],
      [0.025, 0.027, 0.022],
    );
  }
  const wings = [];
  for (const side of [-1, 1]) {
    const w = group(body, [side * 0.16, 0.6, -0.22]);
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.12, 0.56, 0.62, 0.92, 1.02, 0.78);
    shape.bezierCurveTo(1.18, 0.53, 0.88, 0.11, 0.24, -0.025);
    shape.bezierCurveTo(0.7, 0.02, 0.88, -0.32, 0.66, -0.53);
    shape.bezierCurveTo(0.34, -0.6, 0.06, -0.24, 0, 0);
    const wingGeo = geometry("fairy-wing", () => {
      const geo = new THREE.ShapeGeometry(shape, 24);
      const colors = [];
      for (let i = 0; i < geo.attributes.position.count; i++) {
        const y = geo.attributes.position.getY(i);
        const color = new THREE.Color("#bca1ed").lerp(
          new THREE.Color("#a0e5f1"),
          THREE.MathUtils.clamp((y + 0.5) / 1.2, 0, 1),
        );
        colors.push(color.r, color.g, color.b);
      }
      geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      return geo;
    });
    const membrane = mesh(w, wingGeo, "#ffffff", [0, 0, -0.08], [side, 1, 1], {
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
      roughness: 0.36,
      metalness: 0.08,
      depthWrite: false,
    });
    membrane.name = "Pearlescent butterfly wing";
    const outline = shape.getPoints(32).map((p) => [p.x * side, p.y, -0.085]);
    tube(w, "#ecf9ec", outline, 0.017);
    for (const points of [
      [
        [0.04, 0, 0],
        [0.3, 0.28, 0],
        [0.68, 0.57, 0],
        [1.01, 0.76, 0],
      ],
      [
        [0.27, 0.25, 0],
        [0.44, 0.38, 0],
        [0.52, 0.78, 0],
      ],
      [
        [0.39, 0.36, 0],
        [0.65, 0.25, 0],
        [0.95, 0.3, 0],
      ],
      [
        [0.04, -0.03, 0],
        [0.28, -0.21, 0],
        [0.64, -0.49, 0],
      ],
    ])
      tube(
        w,
        "#efffef",
        points.map(([x, y]) => [x * side, y, -0.1]),
        0.012,
      );
    for (const [x, y] of [
      [0.92, 0.64],
      [0.77, 0.65],
      [0.82, 0.44],
      [0.61, -0.39],
    ])
      orb(w, "#fff4c4", [x * side, y, -0.11], [0.025, 0.025, 0.018]);
    bake(w);
    w.traverse((o) => {
      if (o.isMesh) o.receiveShadow = false;
    });
    wings.push(w);
  }
  bake(head);
  bake(body, false);
  root.traverse((o) => {
    if (o.isMesh && !o.material.transparent) o.castShadow = true;
  });
  root.userData = { ...root.userData, body, wings, head };
  return root;
}
export function makeRider() {
  const pony = makePony();
  const mia = makeMia();
  pony.add(mia);
  pony.userData.mia = mia;
  return pony;
}
export function animatePony(
  pony,
  time,
  {
    running = true,
    boost = false,
    jump = 0,
    steer = 0,
    water = 0,
    celebrate = false,
    reduced = false,
  } = {},
) {
  const u = pony.userData,
    phase = time * (boost ? 16 : 11);
  for (let i = 0; i < u.legs.length; i++)
    u.legs[i].rotation.x = running
      ? Math.sin(phase + (i % 3 === 0 ? 0 : Math.PI)) * 0.65
      : Math.sin(time * 2 + i) * 0.045;
  u.body.position.y = running
    ? Math.abs(Math.sin(phase)) * 0.085
    : Math.sin(time * 2) * 0.018;
  u.body.rotation.z = -steer * 0.09;
  u.tail.rotation.x = Math.sin(time * 5) * 0.13;
  u.tail.rotation.z = Math.sin(time * 3) * 0.12;
  if (jump > 0) {
    u.legs.forEach((l, i) => (l.rotation.x = i % 2 ? 0.8 : -0.7));
    u.body.rotation.x = -0.1;
  } else
    u.body.rotation.x = celebrate && !reduced ? Math.sin(time * 3) * 0.06 : 0;
  if (u.mia) {
    const m = u.mia.userData;
    m.wings.forEach(
      (w, i) =>
        (w.rotation.y =
          (i ? 1 : -1) * (0.2 + Math.sin(time * (running ? 6 : 3)) * 0.14)),
    );
    m.body.rotation.x = jump > 0 ? -0.12 : boost ? 0.07 : 0;
    m.arm.rotation.x = water > 0 ? -1.2 : 0;
    m.head.rotation.y = Math.sin(time * 1.6) * 0.08;
  }
}
export function makeCollectionUnicorn(id) {
  return makePony({ unicorn: true, coat: "#fff9f4", hair: MANES[id] });
}
