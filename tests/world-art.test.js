import { test } from "node:test";
import assert from "node:assert/strict";
import { bake, disposeTree } from "../src/art/primitives.js";
import * as pokemon from "../src/worlds/pokemon.js";

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
