import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("character GLBs are isolated, compressed, skinned, and contain expressive faces", async () => {
  let bytes = 0;
  for (const name of ["glender", "unicorn", "mia"]) {
    const buffer = await readFile(
      new URL(`../public/assets/models/${name}.glb`, import.meta.url),
    );
    bytes += buffer.length;
    assert.equal(buffer.readUInt32LE(0), 0x46546c67);
    const gltf = JSON.parse(buffer.subarray(20, 20 + buffer.readUInt32LE(12)));
    assert.equal(
      gltf.scenes.length,
      1,
      "Never export other open Blender scenes",
    );
    assert.equal(
      gltf.scenes[0].nodes.length,
      1,
      "Only the character rig belongs in each asset",
    );
    const root = gltf.nodes[gltf.scenes[0].nodes[0]];
    assert.match(root.name, new RegExp(`^${name} rig`, "i"));
    assert.ok(gltf.extensionsRequired.includes("EXT_meshopt_compression"));
    assert.ok(
      gltf.buffers.every((b) => !b.uri),
      "No external model dependencies",
    );
    const bones = new Set(
      gltf.skins.flatMap((skin) => skin.joints.map((i) => gltf.nodes[i].name)),
    );
    for (const bone of name === "mia"
      ? ["spine", "head", "hair", "wing_L", "wing_R", "arm_R"]
      : ["head", "neck", "tail", "mane", "front_L_shin", "back_R_shin"])
      assert.ok(bones.has(bone), `${name} needs animation joint ${bone}`);
    assert.ok(
      gltf.meshes.some((m) => m.extras?.targetNames?.includes("Blink")),
    );
    const primitives = gltf.meshes.flatMap((m) => m.primitives);
    assert.ok(
      primitives.length <= 24,
      `${name} exceeds the material/draw budget`,
    );
    for (const p of primitives) {
      assert.notEqual(p.attributes.JOINTS_0, undefined);
      assert.notEqual(p.attributes.WEIGHTS_0, undefined);
      assert.notEqual(
        p.attributes.COLOR_0,
        undefined,
        "Painted coat/skin colors must survive export",
      );
    }
    const triangles = primitives.reduce(
      (n, p) => n + gltf.accessors[p.indices].count / 3,
      0,
    );
    assert.ok(
      triangles > 20000 && triangles < 95000,
      `${name}: unexpected topology ${triangles}`,
    );
  }
  assert.ok(bytes < 2_000_000, `Character download budget exceeded: ${bytes}`);
});
