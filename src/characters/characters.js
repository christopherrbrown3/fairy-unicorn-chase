import * as THREE from "three";
import { CHARACTER, MANES } from "../config/levels.js";
import {
  orb,
  cone,
  cylinder,
  mesh,
  group,
  tube,
  star,
  bake,
  geometry,
} from "../art/primitives.js";

function hairColor(hair, i) {
  return hair === "rainbow"
    ? ["#ef8cac", "#ffd26e", "#8ad0a4", "#79caf0", "#b095df"][i % 5]
    : hair;
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
  orb(body, coat, [0, 1.82, 0.62], [0.41, 0.73, 0.44]);
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
    orb(head, "#26394d", [side * 0.36, 0.23, 0.25], [0.052, 0.12, 0.105], {
      roughness: 0.18,
    });
    orb(head, "#ffffff", [side * 0.405, 0.275, 0.28], [0.024, 0.035, 0.028]);
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
  for (let i = 0; i < 8; i++) {
    const c = hairColor(hair, i);
    const lock = orb(
      mane,
      c,
      [i % 2 ? -0.07 : 0.07, 2.38 - i * 0.1, 0.8 - i * 0.09],
      [0.23, 0.22, 0.19],
    );
    lock.rotation.z = i % 2 ? 0.18 : -0.18;
  }
  for (let i = 0; i < 3; i++)
    tube(
      mane,
      hairColor(hair, i),
      [
        [0.05 * (i - 1), 2.7, 0.74],
        [0.17 * (i - 1), 2.7, 1.14],
        [0.22 * (i - 1), 2.45, 1.33],
      ],
      0.09,
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
      orb(leg, hoof, [0, -1.13, 0.09], [0.19, 0.15, 0.26]);
      bake(leg);
      legs.push(leg);
    }
  const tail = group(root, [0, 1.66, -0.85]);
  for (let i = 0; i < 5; i++)
    tube(
      tail,
      hairColor(hair, i),
      [
        [0.06 * (i - 2), 0, 0],
        [0.1 * (i - 2), 0.15, -0.4],
        [0.12 * (i - 2), -0.22, -0.8],
        [0.07 * (i - 2), -0.73, -0.98],
      ],
      0.09,
    );
  bake(tail);
  if (!unicorn) {
    orb(body, "#758ebb", [0, 1.85, -0.13], [0.55, 0.15, 0.6]);
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
    return new THREE.LatheGeometry(points, 20);
  });
  mesh(body, skirtGeo, c.dress, [0, 0.18, 0]);
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
    const lock = tube(
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
    lock.name = "Flowing blonde lock";
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
    const large = orb(
      w,
      c.wings,
      [side * 0.48, 0.23, -0.08],
      [0.55, 0.44, 0.055],
      { transparent: true, opacity: 0.77, metalness: 0.15 },
    );
    large.rotation.z = -side * 0.48;
    const small = orb(
      w,
      "#d1bff4",
      [side * 0.37, -0.23, -0.05],
      [0.38, 0.27, 0.04],
      { transparent: true, opacity: 0.75 },
    );
    small.rotation.z = side * 0.35;
    tube(
      w,
      "#e7f7ff",
      [
        [side * 0.05, 0, -0.145],
        [side * 0.34, 0.15, -0.145],
        [side * 0.73, 0.4, -0.12],
      ],
      0.013,
    );
    bake(w);
    wings.push(w);
  }
  bake(head);
  bake(body, false);
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
