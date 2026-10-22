import { test, expect } from "@playwright/test";

test("sculpted character rigs animate without detached geometry and release old skeletons", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?test=1");
  await page.waitForFunction(() => window.__fairy?.screen === "title");
  const result = await page.evaluate(() => {
    const g = window.__fairy.game;
    g.renderer.setAnimationLoop(null);
    window.__fairy.start(0);
    const leg = g.player.userData.legs[0];
    const initial = leg.quaternion.toArray();
    let bounded = true,
      skinned = 0;
    for (const time of [0.2, 0.5, 1, 1.3, 2.2, 3.9, 4.68]) {
      g.elapsed = time;
      g.lastTime = performance.now();
      g.frame();
      g.player.updateMatrixWorld(true);
      g.player.traverse((mesh) => {
        if (!mesh.isSkinnedMesh) return;
        skinned++;
        mesh.computeBoundingBox();
        const size = mesh.geometry.boundingBox.min.clone();
        mesh.boundingBox.getSize(size);
        bounded &&= size.toArray().every((v) => Number.isFinite(v) && v < 7);
      });
    }
    const moved =
      JSON.stringify(initial) !== JSON.stringify(leg.quaternion.toArray());
    const expression = g.player.userData.morphs.some(
      (m) => m.morphTargetInfluences[m.morphTargetDictionary.Blink] > 0.5,
    );
    const old = g.unicorn;
    const oldMaterials = old.userData.materials;
    const oldSkeletons = new Set();
    old.traverse((m) => {
      if (m.isSkinnedMesh) oldSkeletons.add(m.skeleton);
    });
    g.setWorld(9);
    const colors = new Set(
      g.unicorn.userData.materials
        .filter((m) => m.name.startsWith("Hair |"))
        .map((m) => m.color.getHexString()),
    );
    const independent =
      g.unicorn.userData.bones.head !== old.userData.bones.head &&
      g.unicorn.userData.materials.every((m) => !oldMaterials.includes(m));
    const released = [...oldSkeletons].every((s) => s.boneTexture === null);
    return {
      bounded,
      moved,
      expression,
      skinned,
      colors: colors.size,
      independent,
      released,
      mia: g.player.userData.mia.userData.asset,
      pony: g.player.userData.asset,
      unicorn: g.unicorn.userData.asset,
    };
  });
  expect(result).toMatchObject({
    bounded: true,
    moved: true,
    expression: true,
    independent: true,
    released: true,
    colors: 5,
    mia: "mia",
    pony: "glender",
    unicorn: "unicorn",
  });
  expect(result.skinned).toBeGreaterThan(30);
  expect(errors).toEqual([]);
});
