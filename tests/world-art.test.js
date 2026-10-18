import { test } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { bake, disposeTree } from "../src/art/primitives.js";
import * as pokemon from "../src/worlds/pokemon.js";
import * as carnival from "../src/worlds/carnival.js";
import * as underwater from "../src/worlds/underwater.js";
import * as christmas from "../src/worlds/christmas.js";
import * as breakfast from "../src/worlds/breakfast.js";
import * as downtown from "../src/worlds/downtown.js";
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
  const reef = new underwater.ReefLife(parent, LEVELS.at(-1));
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

test("Christmas snowfall is bounded and freezes with reduced motion", () => {
  const parent = group();
  const snowfall = new christmas.Snowfall(parent, LEVELS.at(-1));
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
