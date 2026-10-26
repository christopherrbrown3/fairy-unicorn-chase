import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as THREE from "three";
import { bake, disposeTree } from "../src/art/primitives.js";
import * as pokemon from "../src/worlds/pokemon.js";
import * as carnival from "../src/worlds/carnival.js";
import * as underwater from "../src/worlds/underwater.js";
import * as christmas from "../src/worlds/christmas.js";
import * as breakfast from "../src/worlds/breakfast.js";
import * as downtown from "../src/worlds/downtown.js";
import * as thundermans from "../src/worlds/thundermans.js";
import * as waterpark from "../src/worlds/waterpark.js";
import * as savannah from "../src/worlds/savannah.js";
import { makeZebra, registerZebraTemplates } from "../src/worlds/zebra-assets.js";
import { group } from "../src/art/primitives.js";
import { Atmosphere } from "../src/art/atmosphere.js";
import { LEVELS } from "../src/config/levels.js";

function triangles(root) {
  let count = 0;
  root.traverse(object => {
    if (object.isMesh) count += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3;
  });
  return count;
}

test("Pokémon scenery keeps every triangle when combined into static batches", () => {
  // A non-indexed tail mixed with indexed body meshes used to erase Pikachu's yellow material.
  for (const [name, make] of Object.entries(pokemon)) {
    const model = make();
    const before = triangles(model);
    assert.ok(before > 0, name);
    bake(model);
    assert.equal(triangles(model), before, `${name} lost geometry during batching`);
    disposeTree(model);
  }
});

test("Candy Carnival scenery keeps every triangle when combined into static batches", () => {
  for (const [name, make] of Object.entries(carnival)) {
    const parent = group();
    const model = name === "donutGate" || name === "cakePavilion"
      ? make(parent)
      : make(parent, 1);
    const before = triangles(model);
    assert.ok(before > 0, name);
    bake(model);
    assert.equal(triangles(model), before, `${name} lost geometry during batching`);
    disposeTree(model);
  }
});

test("Coral Lagoon scenery keeps every triangle when combined into static batches", () => {
  for (const [name, make] of Object.entries(underwater).filter(([name]) => name !== "ReefLife")) {
    const parent = group();
    const model = name === "coralGate" ? make(parent) : make(parent, 1);
    const before = triangles(model);
    assert.ok(before > 0, name);
    bake(model);
    assert.equal(triangles(model), before, `${name} lost geometry during batching`);
    disposeTree(parent);
  }
});

test("Coral Lagoon reef life freezes at reduced time and stays bounded", () => {
  const parent = group();
  const reef = new underwater.ReefLife(
    parent,
    LEVELS.find(level => level.theme === "underwater"),
  );
  reef.update(0, 0);
  const fishAtZero = reef.fish.map(fish => fish.position.toArray());
  const bubblesAtZero = [...reef.bubbles.instanceMatrix.array];
  assert.equal(reef.fish.length, 24);
  assert.equal(reef.bubbles.count, 64);
  reef.update(0, 0);
  assert.deepEqual(reef.fish.map(fish => fish.position.toArray()), fishAtZero);
  assert.deepEqual([...reef.bubbles.instanceMatrix.array], bubblesAtZero);
  reef.update(2, 0);
  assert.notDeepEqual(reef.fish.map(fish => fish.position.toArray()), fishAtZero);
  assert.notDeepEqual([...reef.bubbles.instanceMatrix.array], bubblesAtZero);
  disposeTree(parent);
});

test("Christmas Village scenery keeps every triangle when combined into static batches", () => {
  for (const [name, make] of Object.entries(christmas).filter(([name]) => name !== "Snowfall")) {
    const parent = group();
    const model = make(parent, 1);
    const before = triangles(model);
    assert.ok(before > 0, name);
    bake(model);
    assert.equal(triangles(model), before, `${name} lost geometry during batching`);
    disposeTree(parent);
  }
});

test("Pancake Picnic scenery keeps every triangle when combined into static batches", () => {
  for (const [name, make] of Object.entries(breakfast)) {
    const parent = group();
    const model = name === "breakfastGate" ? make(parent) : make(parent, 1);
    const before = triangles(model);
    assert.ok(before > 0, name);
    bake(model);
    assert.equal(triangles(model), before, `${name} lost geometry during batching`);
    disposeTree(parent);
  }
});

test("Big City Downtown scenery keeps every triangle when combined into static batches", () => {
  for (const [name, make] of Object.entries(downtown)) {
    const parent = group();
    const model = make(parent, 1);
    const before = triangles(model);
    assert.ok(before > 0, name);
    bake(model);
    assert.equal(triangles(model), before, `${name} lost geometry during batching`);
    disposeTree(parent);
  }
});

test("Thundermans Town scenery keeps every triangle when combined into static batches", () => {
  for (const [name, make] of Object.entries(thundermans)) {
    const parent = group();
    const model = make(parent, 1);
    const before = triangles(model);
    assert.ok(before > 0, name);
    bake(model);
    assert.equal(triangles(model), before, `${name} lost geometry during batching`);
    disposeTree(parent);
  }
});

test("Splash Water Park flumes retain their open and enclosed shells through batching", () => {
  for (const enclosed of [false, true]) {
    const geo = waterpark.slideGeometry(2, enclosed);
    const sides = enclosed ? 20 : 12;
    const stride = sides + 1;
    const skin = 49 * stride;
    const floor = geo.attributes.normal;
    const sample = 24 * stride + (enclosed ? 5 : 6);
    assert.ok(floor.getY(sample) > 0.9, "inside flume floor faces upward");
    assert.ok(floor.getY(sample + skin) < -0.9, "outside shell faces downward");
    geo.dispose();
  }

  for (const [name, make] of Object.entries(waterpark)) {
    if (name === "slideGeometry") continue;
    for (let variant = 0; variant < 3; variant++) {
      const container = group();
      const root = group(container);
      make(root, 1, variant);
      const before = triangles(root);
      assert.ok(before > 0, `${name} variant ${variant} has geometry`);
      bake(root);
      assert.equal(triangles(root), before, `${name} variant ${variant} lost triangles`);
      let owned = 0, disposed = 0;
      root.traverse((object) => {
        if (!object.isMesh || !object.userData.ownedGeometry) return;
        owned++;
        object.geometry.addEventListener("dispose", () => disposed++);
      });
      disposeTree(root);
      assert.ok(owned > 0, `${name} variant ${variant} owns baked batch geometry`);
      assert.equal(disposed, owned, `${name} variant ${variant} disposes its baked geometry`);
      assert.equal(container.children.length, 0, `${name} variant ${variant} releases its scene root`);
    }
  }
});

test("Zebra Savannah habitat keeps every static variant through batching and disposal", () => {
  for (const [name, make] of Object.entries(savannah).filter(([name]) => ["grassIsland", "flatTopTree", "termiteMound"].includes(name))) {
    const container = group();
    const parent = group(container);
    for (let variant = 0; variant < 3; variant++) make(parent, 1, variant);
    const before = triangles(parent);
    assert.ok(before > 0, name);
    bake(parent);
    assert.equal(triangles(parent), before, `${name} lost triangles during static batching`);
    let owned = 0, disposed = 0;
    parent.traverse(object => {
      if (!object.isMesh || !object.userData.ownedGeometry) return;
      owned++;
      object.geometry.addEventListener("dispose", () => disposed++);
    });
    disposeTree(parent);
    assert.ok(owned > 0, `${name} owns its baked batch geometry`);
    assert.equal(disposed, owned, `${name} disposes its baked batch geometry`);
    assert.equal(container.children.length, 0, `${name} releases its scene root`);
  }
});

test("Blender zebra GLB embeds six UV-coated adult and foal pose templates", async () => {
  const bytes = await readFile(new URL("../public/assets/models/scenery/plains-zebras.glb", import.meta.url));
  assert.equal(bytes.readUInt32LE(0), 0x46546c67, "GLB magic");
  assert.equal(bytes.readUInt32LE(4), 2, "GLB version");
  assert.equal(bytes.readUInt32LE(8), bytes.length, "GLB header length");
  const jsonLength = bytes.readUInt32LE(12);
  assert.equal(bytes.readUInt32LE(16), 0x4e4f534a, "first chunk is JSON");
  const gltf = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString("utf8"));
  for (const extension of ["EXT_meshopt_compression", "EXT_texture_webp"]) {
    assert.ok(gltf.extensionsUsed?.includes(extension), `${extension} is used by the final asset`);
    assert.ok(gltf.extensionsRequired?.includes(extension), `${extension} is required for the final asset`);
  }
  assert.ok(gltf.buffers.length > 0, "GLB has geometry buffers");
  for (const buffer of gltf.buffers)
    assert.ok(!buffer.uri || buffer.uri.startsWith("data:"), "geometry has no external file dependency");
  const meshoptViews = (gltf.bufferViews || []).filter(view => view.extensions?.EXT_meshopt_compression);
  assert.ok(meshoptViews.length > 0, "geometry uses compressed Meshopt buffer views");
  for (const view of gltf.bufferViews || []) {
    const meshopt = view.extensions?.EXT_meshopt_compression;
    const bufferIndex = Number.isInteger(view.buffer) ? view.buffer : meshopt?.buffer;
    assert.ok(Number.isInteger(bufferIndex) && gltf.buffers[bufferIndex], "buffer view resolves inside the GLB, including Meshopt-only layouts");
    if (meshopt) assert.ok(meshopt.byteLength > 0 && meshopt.count > 0, "Meshopt payload is nonempty and describes geometry");
  }
  assert.equal(gltf.images.length, 4, "two age-specific coats each have standing and grazing images");
  for (const image of gltf.images) {
    assert.equal(image.mimeType, "image/webp", "final coat maps use lossless WebP");
    assert.ok(Number.isInteger(image.bufferView) || image.uri?.startsWith("data:"), "coat image is embedded in the GLB or data URI");
    assert.ok(!image.uri || image.uri.startsWith("data:"), "no external texture dependency");
  }

  const templateNames = [
    "adult-looking", "adult-grazing", "adult-walking",
    "foal-looking", "foal-grazing", "foal-walking",
  ];
  const roots = new Map(gltf.nodes.map((node, index) => [node.name, { ...node, index }]));
  const namedTemplateRoots = gltf.nodes.map(node => node.name).filter(name => /^(adult|foal)-(looking|grazing|walking)$/.test(name));
  assert.deepEqual(namedTemplateRoots.sort(), [...templateNames].sort(), "GLB has exactly the six intended pose roots");
  const textureByPose = new Map();
  const templateNodes = new Set();
  const referencedImages = new Set();
  for (const name of templateNames) {
    const root = roots.get(name);
    assert.ok(root, `missing named GLB template ${name}`);
    const pending = [root.index];
    const visited = new Set();
    const textures = new Set();
    let triangleCount = 0, uvPrimitives = 0;
    while (pending.length) {
      const nodeIndex = pending.pop();
      if (visited.has(nodeIndex)) continue;
      visited.add(nodeIndex);
      templateNodes.add(nodeIndex);
      const node = gltf.nodes[nodeIndex];
      pending.push(...(node.children || []));
      if (node.mesh === undefined) continue;
      for (const primitive of gltf.meshes[node.mesh].primitives) {
        const position = primitive.attributes.POSITION;
        assert.ok(Number.isInteger(position), `${name}: primitive has positions`);
        assert.ok(gltf.accessors[position].count > 0, `${name}: primitive positions are nonempty`);
        const count = primitive.indices === undefined
          ? gltf.accessors[position].count
          : gltf.accessors[primitive.indices].count;
        assert.equal(count % 3, 0, `${name}: triangle index count is aligned`);
        triangleCount += count / 3;
        const uv = primitive.attributes.TEXCOORD_0;
        if (uv !== undefined) {
          uvPrimitives++;
          assert.ok(gltf.accessors[uv].count > 0, `${name}: UV data is nonempty`);
        }
        const material = gltf.materials[primitive.material];
        const texture = material?.pbrMetallicRoughness?.baseColorTexture?.index;
        if (texture !== undefined && uv !== undefined) {
          textures.add(texture);
          const gltfTexture = gltf.textures[texture];
          const webpSource = gltfTexture?.extensions?.EXT_texture_webp?.source;
          assert.ok(Number.isInteger(webpSource), `${name}: coat texture uses EXT_texture_webp`);
          const image = webpSource
            ?? gltfTexture?.extensions?.KHR_texture_basisu?.source
            ?? gltfTexture?.source;
          assert.ok(Number.isInteger(image) && gltf.images[image], `${name}: coat texture resolves to embedded image`);
          referencedImages.add(image);
        }
      }
    }
    assert.ok(triangleCount > 0, `${name}: template has no triangles`);
    assert.ok(uvPrimitives > 0, `${name}: template has no UV geometry`);
    assert.ok(textures.size > 0, `${name}: no textured UV coat`);
    assert.equal(textures.size, 1, `${name}: each pose uses one intended coat map`);
    textureByPose.set(name, [...textures][0]);
  }
  const meshNodes = new Set(gltf.nodes.flatMap((node, index) => node.mesh === undefined ? [] : [index]));
  assert.deepEqual([...meshNodes].sort((a, b) => a - b), [...templateNodes].filter(index => gltf.nodes[index].mesh !== undefined).sort((a, b) => a - b),
    "GLB contains no hidden source cages, bake helpers, or unrelated mesh geometry");
  for (const age of ["adult", "foal"]) {
    assert.equal(textureByPose.get(`${age}-looking`), textureByPose.get(`${age}-walking`), `${age} standing poses share one coat map`);
    assert.notEqual(textureByPose.get(`${age}-grazing`), textureByPose.get(`${age}-looking`), `${age} grazing pose uses its own coat map`);
  }
  assert.notEqual(textureByPose.get("adult-looking"), textureByPose.get("foal-looking"), "adult and foal use distinct coats");
  assert.equal(referencedImages.size, 4, "all four intended coat images are referenced by the six templates");
});

test("zebra template registration rejects incomplete assets without replacing loaded templates", () => {
  const complete = new THREE.Scene();
  const sharedGeometry = new THREE.BufferGeometry();
  sharedGeometry.setAttribute("position", new THREE.Float32BufferAttribute([0,0,0, 1,0,0, 0,1,0], 3));
  sharedGeometry.setAttribute("uv", new THREE.Float32BufferAttribute([0,0, 1,0, 0,1], 2));
  sharedGeometry.setIndex([0,1,2]);
  sharedGeometry.computeVertexNormals();
  const sharedTexture = new THREE.Texture();
  sharedTexture.image = { width: 2048, height: 2048 };
  for (const name of ["adult-looking", "adult-grazing", "adult-walking", "foal-looking", "foal-grazing", "foal-walking"]) {
    const root = new THREE.Group(); root.name = name;
    root.add(new THREE.Mesh(sharedGeometry, new THREE.MeshStandardMaterial({ map: sharedTexture })));
    complete.add(root);
  }
  registerZebraTemplates(complete);
  assert.equal(triangles(makeZebra(null)), 1, "registered template clones normally");

  const missingTemplate = new THREE.Scene();
  assert.throws(() => registerZebraTemplates(missingTemplate), /expected exactly six template roots|Missing Blender zebra template/);
  assert.equal(triangles(makeZebra(null)), 1, "missing-set rejection preserves the previous registration");

  const missingCoat = new THREE.Scene();
  for (const name of ["adult-looking", "adult-grazing", "adult-walking", "foal-looking", "foal-grazing", "foal-walking"]) {
    const root = new THREE.Group(); root.name = name;
    root.add(new THREE.Mesh(sharedGeometry, new THREE.MeshStandardMaterial()));
    missingCoat.add(root);
  }
  assert.throws(() => registerZebraTemplates(missingCoat), /invalid baked UV coat|one textured skin/);
  assert.equal(triangles(makeZebra(null)), 1, "missing-coat rejection preserves the previous registration");
});

test("Christmas snowfall is bounded and freezes with reduced motion", () => {
  const parent = group();
  const snowfall = new christmas.Snowfall(
    parent,
    LEVELS.find(level => level.theme === "christmas"),
  );
  snowfall.update(0, 0);
  const atZero = [...snowfall.flakes.instanceMatrix.array];
  assert.equal(snowfall.flakes.count, 96);
  snowfall.update(0, 0);
  assert.deepEqual([...snowfall.flakes.instanceMatrix.array], atZero);
  snowfall.update(2, 0);
  assert.notDeepEqual([...snowfall.flakes.instanceMatrix.array], atZero);
  disposeTree(parent);
});

test("underwater atmosphere settings reset when returning to a meadow", () => {
  const atmosphere = new Atmosphere(new THREE.Scene());
  atmosphere.setLevel(LEVELS.find(level => level.theme === "underwater"));
  assert.equal(atmosphere.material.uniforms.underwater.value, 1);
  assert.equal(atmosphere.material.uniforms.sunStrength.value, 0);
  atmosphere.setLevel(LEVELS[0]);
  assert.equal(atmosphere.material.uniforms.underwater.value, 0);
  assert.equal(atmosphere.material.uniforms.sunStrength.value, 1);
  assert.ok(atmosphere.material.uniforms.zenith.value.equals(
    new THREE.Color(LEVELS[0].sky).multiplyScalar(0.95),
  ));
  atmosphere.dispose();
});
