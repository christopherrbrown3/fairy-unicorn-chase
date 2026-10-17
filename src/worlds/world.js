import * as THREE from "three";
import { coursePoint, courseItems } from "../config/levels.js";
import {
  mesh,
  geometry,
  orb,
  cone,
  star,
  group,
  bake,
  disposeTree,
} from "../art/primitives.js";
import {
  tree,
  mushroom,
  flower,
  cloud,
  crystal,
  castle,
  rainbow,
  candy,
  potion,
  obstacle,
} from "./props.js";
import { terrainMaterial } from "../art/atmosphere.js";
import { dressVerge, AmbientMagic } from "./dressing.js";
import { WaterGardens } from "./water.js";
import { makeButterfly, animateButterfly } from "../characters/butterfly.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { pokeBall, pikachu, bulbasaur, squirtle, pokemonCenter, pokeGate } from "./pokemon.js";
import { grassBlock, blockTree, diamondOre, blockPig, friendlyCreeper, torch, blockHill, mineGate, blockCloud } from "./minecraft.js";
import { spookyHouse, spookyHall, pumpkin, friendlyGhost } from "./spooky.js";
import { peppermint, wrappedSweet, gummyBear, cupcake, macaron, gumdrops, donutGate, cakePavilion } from "./carnival.js";

let authoredPotion = null;
export async function loadWorldAssets() {
  try {
    const gltf = await new GLTFLoader().loadAsync(
      new URL("assets/models/sparkle-potion.glb", document.baseURI).href,
    );
    authoredPotion = gltf.scene;
  } catch {
    /* The original procedural bottle is a complete fallback. */
  }
}
const rnd = (n) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};
function place(obj, level, s, lane, extraY = 0) {
  const p = coursePoint(level, s, lane);
  obj.position.set(p.x, p.y + extraY, p.z);
  obj.rotation.y = p.yaw;
  return obj;
}
function roadGeometry(level, halfwidth, y = 0) {
  const verts = [],
    uvs = [],
    indices = [],
    length = Math.PI * 2 * level.radius,
    segments = 420;
  for (let i = 0; i <= segments; i++)
    for (const side of [-1, 1]) {
      const p = coursePoint(level, (i / segments) * length, side * halfwidth);
      verts.push(p.x, p.y + y, p.z);
      uvs.push((side + 1) / 2, i / segments);
    }
  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
export class World {
  constructor(scene, level) {
    this.scene = scene;
    this.level = level;
    this.root = group(scene);
    this.potions = [];
    this.butterflies = [];
    this.ghosts = [];
    this.chunks = [];
    scene.background = new THREE.Color(level.sky);
    scene.fog = new THREE.Fog(level.sky, 55, 155);
    const ground = mesh(
      this.root,
      geometry("ground", () => new THREE.CylinderGeometry(1100, 1100, 2, 64)),
      level.ground,
      [0, -1.6, 0],
    );
    ground.material = terrainMaterial(level.ground);
    ground.userData.ownedMaterial = true;
    for (const [width, y, color] of [
      [35, -0.13, level.ground],
      [level.width / 2 + 0.15, -0.025, level.ground],
      [level.width / 2, 0, level.road],
    ]) {
      const m = mesh(this.root, roadGeometry(level, width, y), color);
      m.userData.ownedGeometry = true;
      m.material = terrainMaterial(color, {
        road: color === level.road,
        edge: level.ground,
        halfwidth: width,
      });
      m.userData.ownedMaterial = true;
    }
    this.verge = dressVerge(this.root, level);
    this.water = new WaterGardens(this.root, level);
    this.ambient = new AmbientMagic(this.root, level);
    const length = Math.PI * 2 * level.radius;
    for (let j = 0; j < 16; j++) {
      const chunk = group(this.root);
      this.chunks.push(chunk);
      for (let k = 0; k < 9; k++) {
        const s = ((j * 9 + k) / 144) * length;
        for (const side of [-1, 1]) {
          const seed = j * 40 + k * 2 + (side + 1) / 2 + level.id * 731;
          let dist = level.width / 2 + 3 + rnd(seed) * 9;
          let prop;
          switch (level.theme) {
            case "carnival":
              prop = [peppermint, wrappedSweet, gummyBear, cupcake, macaron, gumdrops][k % 6](chunk, 1.1);
              if (k % 6 === 3) dist += 2;
              break;
            case "pokemon":
              prop = k % 6 === 0 ? pikachu(chunk, 1.3)
                : k % 6 === 1 ? flower(chunk, level.accent, 1.8)
                : k % 6 === 2 ? bulbasaur(chunk, 1.2)
                : k % 6 === 3 ? tree(chunk, level.foliage, 0.85)
                : k % 6 === 4 ? squirtle(chunk, 1.3)
                : pokeBall(chunk, 1.15);
              break;
            case "minecraft":
              prop = [blockTree, grassBlock, blockPig, diamondOre, blockTree, friendlyCreeper][k % 6](chunk);
              break;
            case "spooky":
              prop = k % 4 === 0 ? spookyHouse(chunk, 1.3) : k % 2 ? pumpkin(chunk, 1.2) : tree(chunk, level.foliage, 1);
              if (k % 4 === 0) dist += 4;
              break;
            case "forest":
              prop =
                k % 3 === 0
                  ? mushroom(chunk, level.accent, 1.8)
                  : tree(chunk, level.foliage, 1 + rnd(seed + 2) * 0.7);
              break;
            case "cloud":
              prop = cloud(chunk, 1.2 + rnd(seed) * 1.8);
              break;
            case "castle":
              prop =
                k % 8 === 0
                  ? castle(chunk, level.foliage, 1.6)
                  : tree(chunk, k % 2 ? "#b4c894" : "#e4adbd", 0.8);
              break;
            case "candy":
              prop =
                k % 3 === 0
                  ? mushroom(chunk, "#dd9cda", 1.7)
                  : candy(
                      chunk,
                      [level.accent, "#eaa6c7", "#d3b4e5"][k % 3],
                      1.1,
                    );
              break;
            case "crystal":
              prop = crystal(
                chunk,
                ["#b5a6f2", "#78b9cf", "#f2bb96"][k % 3],
                1.4 + rnd(seed),
              );
              break;
            case "garden":
              prop =
                k % 3
                  ? flower(
                      chunk,
                      ["#f399b0", "#e7a3d5", "#ffdaa1"][k % 3],
                      3 + rnd(seed) * 2,
                    )
                  : tree(chunk, level.foliage, 0.7);
              break;
            case "night":
              prop =
                k % 3 === 0
                  ? crystal(chunk, "#9e91cc", 0.9)
                  : tree(chunk, level.foliage, 1);
              star(chunk, "#fff2ba", [0, 0, 0], 0.3);
              break;
            case "mountain":
              if (k % 3 === 0) {
                prop = group(chunk);
                cone(prop, "#b2adc4", [0, 9, 0], [8, 23, 8]);
                cone(prop, "#f6f2f7", [0, 16.4, 0], [3.9, 8.3, 3.9]);
                dist = 23 + rnd(seed) * 8;
              } else prop = tree(chunk, level.foliage, 0.9);
              break;
            case "palace":
              prop =
                k % 7 === 0
                  ? castle(chunk, level.foliage, 1.7, true)
                  : flower(chunk, level.accent, 2);
              break;
            default:
              prop =
                k % 4
                  ? flower(
                      chunk,
                      ["#f1aac0", "#ffe19a", "#b49edb"][k % 3],
                      1.2 + rnd(seed),
                    )
                  : tree(chunk, level.foliage, 0.9 + rnd(seed) * 0.4);
          }
          place(
            prop,
            level,
            s,
            side * dist,
            level.theme === "cloud" ? -1.4 : 0,
          );
          prop.rotation.y += (rnd(seed + 55) - 0.5) * 0.6;
          if (
            (level.theme === "castle" && k % 8 === 0) ||
            (level.theme === "palace" && k % 7 === 0) ||
            level.theme === "pokemon" ||
            level.theme === "carnival" ||
            level.theme === "minecraft" ||
            (level.theme === "spooky" && k % 4 === 0) ||
            level.theme === "candy"
          )
            prop.rotation.y += Math.PI;
          if (
            ["meadow", "forest", "castle", "palace", "garden", "pokemon"].includes(
              level.theme,
            )
          ) {
            for (let f = 0; f < 4; f++)
              place(
                flower(
                  chunk,
                  ["#f1aac0", "#ffe19a", "#b9a5de"][f % 3],
                  0.55 + rnd(seed + f + 7) * 0.55,
                ),
                level,
                s + f * 0.8 - 1.2,
                side * (level.width / 2 + 0.9 + rnd(seed + f + 12) * 2.6),
              );
          }
        }
      }
      bake(chunk);
      chunk.traverse((o) => {
        if (o.isMesh) o.castShadow = true;
      });
    }
    const landmarks = group(this.root);
    for (let i = 0; i < 28; i++) {
      const s = (i / 28) * length;
      if (level.theme === "minecraft") {
        for (const side of [-1, 1]) place(blockHill(landmarks, 1 + rnd(i) * 0.6), level, s, side * (42 + rnd(i + 8) * 24));
      }
      if (!["crystal", "cloud", "minecraft"].includes(level.theme)) {
        for (const side of [-1, 1]) {
          const tone = new THREE.Color(level.foliage)
            .lerp(new THREE.Color(level.sky), 0.2 + 0.2 * rnd(i + 14))
            .getStyle();
          const hill = orb(
            landmarks,
            tone,
            [0, 0, 0],
            [21 + rnd(i + 3) * 14, 8 + rnd(i + 5) * 12, 26 + rnd(i + 9) * 13],
          );
          place(hill, level, s, side * (48 + rnd(i + 8) * 35), -3.5);
        }
      }
      if (level.theme === "cloud") {
        const island = group(landmarks);
        orb(island, "#b8d7c5", [0, 0, 0], [5, 0.65, 4]);
        const rock = cone(island, "#c5bcda", [0, -2.8, 0], [4, 6, 3.5]);
        rock.rotation.z = Math.PI;
        tree(island, "#b0cce5", 0.8).position.set(-1, 0, 0);
        flower(island, "#ffdba0", 1.5).position.set(2, 0.4, 1);
        cloud(island, 1.5).position.set(0, -4, 0);
        place(
          island,
          level,
          s,
          (i % 2 ? 1 : -1) * (24 + rnd(i) * 18),
          2 + rnd(i + 7) * 6,
        );
      }
    }
    for (let i = 0; i < 8; i++) {
      const s = (i * length) / 8;
      if (["meadow", "cloud", "mountain", "palace"].includes(level.theme))
        place(rainbow(landmarks, 1.7), level, s, 0, 0.7);
      if (
        ["meadow", "forest", "garden", "castle", "candy", "palace"].includes(
          level.theme,
        )
      )
        place(
          orb(landmarks, level.foliage, [0, 0, 0], [15, 5 + rnd(i) * 7, 18]),
          level,
          s + 22,
          35,
          -1.5,
        );
      if (level.theme === "mountain") {
        const m = cone(landmarks, "#aca8c2", [0, 0, 0], [22, 48, 22]);
        place(m, level, s, -55, 16);
        place(
          cone(landmarks, "#f5eef6", [0, 0, 0], [10, 22, 10]),
          level,
          s,
          -55,
          30,
        );
      }
      if (level.theme === "pokemon") {
        const gate = place(pokeGate(landmarks), level, s + 65, 0);
        gate.rotation.y += Math.PI;
        const welcome = place(pikachu(landmarks, 1.4), level, s + 38, -7);
        welcome.rotation.y += Math.PI;
        if (i % 2 === 0) {
          const center = place(pokemonCenter(landmarks), level, s + 48, 21);
          center.rotation.y += Math.PI;
        }
      }
      if (level.theme === "carnival") {
        const gate = place(donutGate(landmarks), level, s + 60, 0);
        gate.rotation.y += Math.PI;
        if (i % 2 === 0) {
          const pavilion = place(cakePavilion(landmarks), level, s + 43, (i % 4 ? -1 : 1) * 24);
          pavilion.rotation.y += Math.PI;
        }
      }
      if (level.theme === "minecraft") {
        place(mineGate(landmarks), level, s + 60, 0);
        for (const side of [-1, 1]) {
          place(torch(landmarks), level, s + 30, side * 6.4);
          place(grassBlock(landmarks, 2), level, s + 12, side * 7);
        }
      }
      if (level.theme === "spooky") place(spookyHall(landmarks), level, s + 52, 0);
      if (level.theme === "crystal") {
        place(
          cone(landmarks, "#454869", [0, 0, 0], [24, 40, 22]),
          level,
          s,
          -40,
          12,
        );
        const arch = mesh(
          landmarks,
          geometry(
            "cavearch",
            () => new THREE.TorusGeometry(13, 3, 6, 20, Math.PI),
          ),
          "#61678d",
        );
        place(arch, level, s + 26, 0, -1);
      }
      if (["night", "spooky"].includes(level.theme)) {
        const p = coursePoint(level, s, -35);
        star(landmarks, "#fff0b4", [p.x, 18 + rnd(i) * 14, p.z], 0.75);
      }
      place((level.theme === "minecraft" ? blockCloud : cloud)(landmarks, 2.5 + rnd(i) * 3), level, s, 45, 25 + rnd(i) * 15);
    }
    if (["night", "spooky"].includes(level.theme)) {
      place(
        orb(landmarks, "#fff0c1", [0, 0, 0], [6, 6, 6], {
          emissive: "#ffe8a4",
          emissiveIntensity: 0.4,
        }),
        level,
        70,
        45,
        40,
      );
    }
    bake(landmarks);
    if (["night", "spooky"].includes(level.theme)) {
      this.sky = group(this.root);
      const shapes = geometry("sky-star", () => {
        const shape = new THREE.Shape();
        for (let i = 0; i < 10; i++) {
          const a = (i * Math.PI) / 5,
            r = i % 2 ? 0.22 : 0.55;
          i
            ? shape.lineTo(Math.cos(a) * r, Math.sin(a) * r)
            : shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        return new THREE.ShapeGeometry(shape);
      });
      const stars = new THREE.InstancedMesh(
        shapes,
        new THREE.MeshBasicMaterial({
          color: "#fff0bb",
          side: THREE.DoubleSide,
          fog: false,
        }),
        110,
      );
      stars.userData.ownedMaterial = true;
      const dummy = new THREE.Object3D();
      for (let i = 0; i < 110; i++) {
        const a = rnd(i + 199) * Math.PI * 2;
        dummy.position.set(
          Math.sin(a) * 95,
          12 + rnd(i + 31) * 60,
          Math.cos(a) * 95,
        );
        dummy.lookAt(0, 20, 0);
        dummy.scale.setScalar(0.45 + rnd(i + 13) * 0.85);
        dummy.updateMatrix();
        stars.setMatrixAt(i, dummy.matrix);
      }
      this.sky.add(stars);
      this.moon = mesh(
        this.sky,
        geometry("moon", () => new THREE.SphereGeometry(4, 16, 12)),
        "#fff2c0",
        [0, 30, 100],
        [1, 1, 1],
        { emissive: "#fff2c0", emissiveIntensity: 0.5 },
      );
    }
    if (level.theme === "spooky") {
      for (let i = 0; i < 28; i++) {
        const ghost = friendlyGhost(this.root, 1.1);
        ghost.userData = { s: 25 + i * length / 28, lane: (i % 2 ? 1 : -1) * 7, phase: i * 1.7 };
        this.ghosts.push(ghost);
      }
    }
    for (const item of courseItems(level)) {
      if (item.kind === "potion") {
        const g = group(this.root);
        g.name = "Potion pickup";
        const model = authoredPotion ? authoredPotion.clone() : potion();
        g.add(model);
        place(g, level, item.s, item.lane, 0.6);
        g.userData = { ...item, baseY: g.position.y };
        this.potions.push(g);
      } else {
        const g = level.theme === "minecraft" && item.kind === "tree"
          ? blockTree(this.root, 0.65)
          : level.theme === "carnival" && item.kind === "tree"
            ? peppermint(this.root, 0.6)
            : obstacle(this.root, item.kind);
        place(g, level, item.s, item.lane);
        bake(g);
      }
    }
    if (
      ["garden", "meadow", "forest", "castle", "palace", "pokemon"].includes(level.theme)
    )
      for (let i = 0; i < (level.theme === "garden" ? 28 : 14); i++) {
        const b = makeButterfly(this.root, i);
        const count = level.theme === "garden" ? 28 : 14;
        b.scale.setScalar(
          level.theme === "garden" ? 0.82 + rnd(i + 31) * 0.38 : 0.58,
        );
        b.userData = {
          ...b.userData,
          s: 15 + (i * length) / count,
          lane: (i % 2 ? 1 : -1) * (level.width / 2 + 0.6 + rnd(i + 16) * 3),
          base: 1.5 + rnd(i) * 1.8,
          phase: i * 1.71,
          escort: level.theme === "garden" && i < 2,
        };
        this.butterflies.push(b);
      }
  }
  update(time, chase, camera) {
    if (this.sky && camera) {
      this.sky.position.copy(camera.position);
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      direction.y = 0;
      direction.normalize();
      this.moon.position.set(
        direction.x * 100 + direction.z * 25,
        31,
        direction.z * 100 - direction.x * 25,
      );
    }
    this.ambient.update(time, chase?.s ?? 0);
    this.verge.update(time);
    this.water.update(time);
    for (const p of this.potions) {
      p.rotation.y = time * 0.8;
      p.position.y =
        p.userData.baseY + Math.sin(time * 2 + p.userData.s) * 0.15;
      const lap = chase ? Math.floor(chase.s / chase.lap) : 0;
      p.visible = !chase?.collected.has(`${lap}:${p.userData.id}`);
    }
    for (const ghost of this.ghosts) {
      const d = ghost.userData;
      place(ghost, this.level, d.s, d.lane, 1.5 + Math.sin(time * 1.5 + d.phase) * 0.35);
      ghost.rotation.y += Math.PI;
    }
    for (const b of this.butterflies) {
      const escort = b.userData.escort;
      const anchor = escort
        ? (chase?.s ?? 0) + 9 + b.userData.phase * 5
        : b.userData.s;
      place(
        b,
        this.level,
        anchor + Math.sin(time * 0.48 + b.userData.phase) * 3,
        (escort ? Math.sign(b.userData.lane) * 4.6 : b.userData.lane) +
          Math.cos(time * 0.7 + b.userData.phase) * (escort ? 0.5 : 1.3),
        b.userData.base + Math.sin(time * 1.8 + b.userData.phase) * 0.42,
      );
      b.rotation.y += Math.cos(time * 0.48 + b.userData.phase) * 0.55;
      animateButterfly(b, time, b.userData.phase);
    }
  }
  dispose() {
    this.ambient.dispose();
    this.verge.dispose();
    this.water.dispose();
    disposeTree(this.root);
  }
}
