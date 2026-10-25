import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const templates = new Map();
let loading;
const poses = ["looking", "grazing", "walking"];
const keys = ["adult", "foal"].flatMap(age => poses.map(pose => `${age}-${pose}`));

// The scene pack owns immutable geometry, materials and maps for app lifetime.
// Chunks borrow the skins and own only instance buffers and baked small parts.
export function registerZebraTemplates(scene) {
  if (scene.children.length !== keys.length || scene.children.some(root => !keys.includes(root.name)))
    throw new Error("Invalid Blender zebra pack: expected exactly six template roots");
  const next = new Map();
  for (const age of ["adult", "foal"]) for (const pose of poses) {
    const key = `${age}-${pose}`, model = scene.children.find(root => root.name === key);
    if (!model) throw new Error(`Missing Blender zebra template: ${key}`);
    const skins = [];
    model.traverse(object => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
      if (!object.material.map) return;
      const { position, normal, uv } = object.geometry.attributes;
      const image = object.material.map.image;
      if (!position?.count || !normal?.count || uv?.count !== position.count ||
          !image || !(image.width || image.naturalWidth) || !(image.height || image.naturalHeight))
        throw new Error(`Zebra template has an invalid baked UV coat: ${key}`);
      object.userData.zebraSkin = { key, age, pose };
      object.userData.dynamic = true; // Never flatten a shared textured skin.
      skins.push(object);
    });
    if (skins.length !== 1) throw new Error(`Zebra template must have one textured skin: ${key}`);
    next.set(key, model);
  }
  templates.clear();
  for (const [key, model] of next) templates.set(key, model);
}

export function loadZebraAssets(baseURL = document.baseURI) {
  if (!loading) {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    loading = loader.loadAsync(new URL("assets/models/scenery/plains-zebras.glb", baseURL).href)
      .then(({ scene }) => registerZebraTemplates(scene))
      .catch(error => { loading = null; throw error; });
  }
  return loading;
}

export function makeZebra(parent, scale = 1, variant = 0, foal = false) {
  const pose = poses[((variant % 3) + 3) % 3], age = foal ? "foal" : "adult";
  const template = templates.get(`${age}-${pose}`);
  if (!template) throw new Error("Blender zebra assets must load before world creation");
  const model = template.clone(true);
  model.name = `Plains zebra ${age} ${pose} | Blender`;
  model.scale.multiplyScalar(scale);
  parent?.add(model);
  return model;
}

// Capture full inherited placement before ordinary material baking. Keep each
// imported skin's own transform (including any glTF quantization transform).
export function detachZebraSkins(chunk) {
  chunk.updateWorldMatrix(true, true);
  const inverse = chunk.matrixWorld.clone().invert(), buckets = new Map(), remove = [];
  chunk.traverse(object => {
    const skin = object.userData.zebraSkin;
    if (!object.isMesh || !skin) return;
    if (!buckets.has(skin.key)) buckets.set(skin.key, {
      ...skin, geometry: object.geometry, material: object.material, matrices: [],
    });
    buckets.get(skin.key).matrices.push(inverse.clone().multiply(object.matrixWorld));
    remove.push(object);
  });
  for (const object of remove) object.removeFromParent();
  return [...buckets.values()];
}

// Called AFTER bake(chunk): InstancedMesh isMesh=true, so an ordinary geometry
// merge would otherwise silently lose all instance placements.
export function addZebraSkinInstances(chunk, buckets) {
  for (const { age, pose, geometry, material, matrices } of buckets) {
    const skin = new THREE.InstancedMesh(geometry, material, matrices.length);
    skin.name = `Plains zebra skin ${age} ${pose}`;
    skin.userData.dynamic = true;
    skin.userData.zebraSkinTemplate = `${age}-${pose}`;
    matrices.forEach((matrix, index) => skin.setMatrixAt(index, matrix));
    skin.instanceMatrix.needsUpdate = true;
    skin.computeBoundingBox();
    skin.computeBoundingSphere();
    skin.castShadow = true;
    skin.receiveShadow = true;
    chunk.add(skin);
  }
}
