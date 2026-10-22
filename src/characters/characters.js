import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { CHARACTER, MANES } from "../config/levels.js";

// Original sculpted storybook cast. Geometry is shared; skeletons, expressions,
// and palette materials belong to each instance. Source: blender_characters.py.
const templates = new Map();
let loading;
export function loadCharacterAssets(baseURL = document.baseURI) {
  if (!loading) {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loading = Promise.all(
      ["glender", "unicorn", "mia"].map(async (name) => {
        const { scene } = await loader.loadAsync(
          new URL(`assets/models/${name}.glb`, baseURL).href,
        );
        templates.set(name, scene);
      }),
    ).catch((error) => {
      loading = null;
      throw error;
    });
  }
  return loading;
}

// Broad studio reflections, computed once per renderer. Applied to characters
// only, preserving the existing lighting and palette of every world.
export function createCharacterEnvironment(renderer) {
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, 0.06, 0.1, 100, { size: 128 });
  room.dispose();
  pmrem.dispose();
  return environment;
}

const surfaceMaps = new Map();
function fiberNormal(kind) {
  if (surfaceMaps.has(kind)) return surfaceMaps.get(kind);
  const size = 128,
    pixels = new Uint8Array(size * size * 4);
  // Deterministic microstructure: woven silk or longitudinal hair fibers.
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const nx = Math.sin((x * Math.PI) / 2) * (kind === "hair" ? 17 : 10);
      const ny =
        kind === "hair"
          ? Math.sin((y * Math.PI) / 16) * 2
          : Math.sin((y * Math.PI) / 2) * 10;
      pixels.set([128 + nx, 128 + ny, 253, 255], (y * size + x) * 4);
    }
  const texture = new THREE.DataTexture(pixels, size, size);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.repeat.set(kind === "hair" ? 1 : 6, kind === "hair" ? 1 : 4);
  texture.needsUpdate = true;
  surfaceMaps.set(kind, texture);
  return texture;
}
const rainbow = ["#ed91b5", "#ffd476", "#9bd4b2", "#8acfe9", "#baa2e2"];
const shades = [0, -0.025, 0.035, -0.055, 0.065];
function makeMaterial(source, hair, environment, isUnicorn) {
  const name = source.name;
  const mat = new THREE.MeshPhysicalMaterial({
    name,
    color: source.color,
    vertexColors: source.vertexColors,
    roughness: source.roughness,
    metalness: source.metalness,
    opacity: source.opacity,
    transparent: source.transparent,
    side: source.side,
    envMap: environment,
    envMapIntensity: 0.42,
  });
  if (name.startsWith("Hair |")) {
    const index = Number(name.match(/strand (\d)/)?.[1] || 0);
    mat.color.set(hair === "rainbow" ? rainbow[index] : hair);
    if (hair !== "rainbow") mat.color.offsetHSL(0, 0, shades[index]);
    mat.roughness = 0.43;
    mat.metalness = 0.01;
    mat.sheen = 0.35;
    mat.sheenColor.copy(mat.color).lerp(new THREE.Color("#fff4db"), 0.65);
    mat.sheenRoughness = 0.43;
    mat.normalMap = fiberNormal("hair");
    mat.normalScale.setScalar(0.23);
    mat.anisotropy = 0.45;
    mat.anisotropyRotation = Math.PI / 2;
  } else if (name.startsWith("Coat |") || name.startsWith("Skin |")) {
    mat.roughness = 0.58;
    mat.sheen = 0.22;
    mat.sheenColor.set("#f7d5c0");
    mat.sheenRoughness = 0.75;
    mat.envMapIntensity = 0.22;
  } else if (name.startsWith("Dress |")) {
    mat.sheen = 0.55;
    mat.sheenColor.set("#bbdef4");
    mat.sheenRoughness = 0.65;
    mat.normalMap = fiberNormal("silk");
    mat.normalScale.setScalar(0.15);
    mat.side = THREE.DoubleSide;
  } else if (name.startsWith("Eyes |")) {
    mat.clearcoat = 1;
    mat.clearcoatRoughness = 0.08;
    mat.envMapIntensity = 0.7;
    if (name.includes("iris") && isUnicorn) mat.color.set("#8074bb");
  } else if (name.startsWith("Wings | opal")) {
    mat.side = THREE.DoubleSide;
    mat.depthWrite = false;
    mat.transparent = true;
    mat.opacity = 0.56;
    mat.iridescence = 0.85;
    mat.iridescenceIOR = 1.3;
    mat.iridescenceThicknessRange = [180, 410];
    mat.roughness = 0.58;
    mat.clearcoat = 0.15;
    mat.clearcoatRoughness = 0.65;
    // Thin membranes catch the world's light without reflecting studio walls.
    mat.envMap = null;
    mat.envMapIntensity = 0;
  } else if (name.startsWith("Gold |")) mat.envMapIntensity = 0.9;
  else if (isUnicorn && name.startsWith("Hooves |")) mat.color.set("#a796b6");
  return mat;
}

function instantiate(name, { hair = CHARACTER.hair, environment = null } = {}) {
  const template = templates.get(name);
  if (!template) throw new Error(`Character asset ${name} has not loaded`);
  const root = new THREE.Group(),
    body = new THREE.Group(),
    model = clone(template);
  root.add(body);
  body.add(model);
  const materials = new Map(),
    bones = {},
    morphs = [],
    rests = new Map();
  model.updateMatrixWorld(true);
  model.traverse((o) => {
    if (o.isBone) {
      bones[o.name] = o;
      const basis = o.getWorldQuaternion(new THREE.Quaternion());
      rests.set(o, {
        quaternion: o.quaternion.clone(),
        basis,
        inverse: basis.clone().invert(),
      });
    }
    if (!o.isMesh) return;
    const source = o.material;
    if (!materials.has(source))
      materials.set(
        source,
        makeMaterial(source, hair, environment, name === "unicorn"),
      );
    o.material = materials.get(source);
    o.userData.ownedMaterial = true;
    o.castShadow = o.receiveShadow = !o.material.transparent;
    // Bind-pose bounds exclude galloping hooves and fluttering wings.
    o.frustumCulled = false;
    if (o.morphTargetDictionary?.Blink !== undefined) morphs.push(o);
  });
  root.userData = {
    body,
    bones,
    rests,
    morphs,
    model,
    asset: name,
    materials: [...materials.values()],
  };
  return root;
}

const rotation = new THREE.Quaternion(),
  localRotation = new THREE.Quaternion();
const angles = new THREE.Euler();
function pose(character, bone, x = 0, y = 0, z = 0) {
  if (!bone) return;
  const rest = character.userData.rests.get(bone);
  rotation.setFromEuler(angles.set(x, y, z));
  localRotation.copy(rest.inverse).multiply(rotation).multiply(rest.basis);
  bone.quaternion.copy(rest.quaternion).multiply(localRotation);
}
function blink(character, time, offset) {
  const phase = (time + offset) % 4.8;
  const strength =
    phase < 4.58 ? 0 : Math.sin(((phase - 4.58) / 0.22) * Math.PI);
  for (const mesh of character.userData.morphs)
    mesh.morphTargetInfluences[mesh.morphTargetDictionary.Blink] = strength;
}

export function makePony({
  unicorn = false,
  hair = CHARACTER.hair,
  environment = null,
} = {}) {
  const root = instantiate(unicorn ? "unicorn" : "glender", {
    hair,
    environment,
  });
  root.name = unicorn ? "White unicorn" : "Glender";
  const u = root.userData,
    b = u.bones;
  Object.assign(u, {
    unicorn,
    head: b.head,
    mane: b.mane,
    tail: b.tail,
    legs: [b.front_L, b.front_R, b.back_L, b.back_R],
    knees: [b.front_L_shin, b.front_R_shin, b.back_L_shin, b.back_R_shin],
  });
  return root;
}
export function makeMia(options) {
  const root = instantiate("mia", options);
  root.name = "Mia";
  const u = root.userData;
  Object.assign(u, {
    head: u.bones.head,
    arm: u.bones.arm_R,
    wings: [u.bones.wing_L, u.bones.wing_R],
  });
  return root;
}
export function makeRider(options) {
  const pony = makePony(options),
    mia = makeMia(options);
  pony.userData.body.add(mia);
  pony.userData.mia = mia;
  return pony;
}
export function makeCollectionUnicorn(id, options = {}) {
  return makePony({ ...options, unicorn: true, hair: MANES[id] });
}

const gaitOffsets = [0, 0.65, Math.PI + 0.35, Math.PI + 1.0];
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
    phase = time * (boost ? 15 : 10.5);
  // Four offset contacts with two-joint flexion; rider and tack share suspension.
  u.legs.forEach((leg, i) => {
    const stride = phase + gaitOffsets[i];
    let swing = running ? Math.sin(stride) * (i < 2 ? 0.49 : 0.43) : 0;
    let knee = running
      ? Math.max(0, Math.cos(stride)) * (i < 2 ? 0.72 : -0.54)
      : 0;
    if (jump > 0) {
      swing = i < 2 ? -0.58 : 0.56;
      knee = i < 2 ? 0.98 : -0.72;
    }
    pose(pony, leg, swing);
    pose(pony, u.knees[i], knee);
  });
  pose(
    pony,
    u.bones.neck,
    running ? Math.sin(phase) * 0.025 : Math.sin(time * 1.5) * 0.012,
  );
  pose(
    pony,
    u.head,
    running ? Math.sin(phase + 0.5) * 0.035 : Math.sin(time * 1.4) * 0.02,
    reduced ? 0 : Math.sin(time * 0.85) * 0.045,
  );
  pose(
    pony,
    u.mane,
    reduced ? 0 : Math.sin(time * 3.4) * 0.025,
    0,
    steer * 0.025,
  );
  pose(
    pony,
    u.tail,
    reduced ? 0 : 0.03 + Math.sin(time * 4.2) * 0.09,
    reduced ? 0 : Math.sin(time * 2.3) * 0.1,
    steer * 0.07,
  );
  u.body.position.y = running
    ? Math.abs(Math.sin(phase + 0.2)) * 0.065
    : Math.sin(time * 1.7) * 0.012;
  u.body.rotation.set(
    jump > 0 ? -0.07 : celebrate && !reduced ? Math.sin(time * 2.5) * 0.035 : 0,
    0,
    -steer * 0.075,
  );
  blink(pony, time, u.unicorn ? 1.3 : 0);
  if (u.mia) {
    const mia = u.mia,
      m = mia.userData;
    blink(mia, time, 0.8);
    pose(
      mia,
      m.bones.spine,
      jump > 0
        ? -0.08
        : boost
          ? 0.055
          : running
            ? Math.sin(phase + 0.7) * 0.018
            : 0,
    );
    pose(mia, m.head, 0, reduced ? 0 : Math.sin(time * 1.25) * 0.055);
    pose(mia, m.bones.hair, reduced ? 0 : Math.sin(time * 3.7) * 0.027);
    pose(mia, m.arm, water > 0 ? -1.05 : 0);
    m.wings.forEach((wing, i) =>
      pose(
        mia,
        wing,
        0,
        (i ? 1 : -1) *
          (0.16 + (reduced ? 0 : Math.sin(time * (running ? 6 : 3)) * 0.17)),
      ),
    );
  }
}
