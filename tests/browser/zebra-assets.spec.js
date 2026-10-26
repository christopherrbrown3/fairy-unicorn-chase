import { test, expect } from "@playwright/test";

const waitForGame = async page => {
  await page.waitForFunction(
    () => window.__fairy?.game && window.__fairy.screen === "title",
    undefined,
    { timeout: 60_000 },
  );
  await page.evaluate(() => window.__fairy.game.renderer.setAnimationLoop(null));
};

test("Zebra Savannah loads and renders all Blender coat templates, then releases only world-owned buffers", async ({ page }) => {
  test.setTimeout(120_000);
  const errors = [];
  const glbResponses = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("response", response => {
    if (response.url().includes("assets/models/scenery/plains-zebras.glb"))
      glbResponses.push({ status: response.status(), contentType: response.headers()["content-type"] });
  });

  await page.goto("/?test=1");
  await waitForGame(page);
  await page.getByRole("button", { name: "Let’s play" }).click();
  expect(glbResponses).toHaveLength(1);
  expect(glbResponses[0]).toMatchObject({ status: 200, contentType: "model/gltf-binary" });

  const result = await page.evaluate(() => {
    const game = window.__fairy.game;
    game.setWorld(21);
    game.frame();
    const world = game.world;
    const skinInstances = [];
    const ownedGeometries = [];
    world.root.traverse(object => {
      if (object.isMesh && object.userData.ownedGeometry) ownedGeometries.push(object.geometry);
      if (!object.isInstancedMesh) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      const skinMaterial = materials.find(material => material?.map && /coat|zebra/i.test(material.name));
      if (skinMaterial) skinInstances.push({ object, material: skinMaterial });
    });

    const matrix = {
      elements: new Float32Array(16),
      fromArray(array, offset = 0) { this.elements.set(array.slice(offset, offset + 16)); return this; },
    };
    const multiply = (a, b) => {
      const out = new Float64Array(16);
      for (let column = 0; column < 4; column++) for (let row = 0; row < 4; row++)
        for (let k = 0; k < 4; k++) out[column * 4 + row] += a[k * 4 + row] * b[column * 4 + k];
      return out;
    };
    const projection = multiply(game.camera.projectionMatrix.elements, game.camera.matrixWorldInverse.elements);
    let visibleInstances = 0;
    const summaries = skinInstances.map(({ object, material }) => {
      const geometry = object.geometry;
      const positionAttribute = geometry.attributes.position;
      const uv = geometry.attributes.uv;
      const normal = geometry.attributes.normal;
      const indexCount = geometry.index?.count ?? positionAttribute?.count ?? 0;
      const image = material.map.image;
      let minX = Infinity, minY = Infinity, minZ = Infinity;
      let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
      if (positionAttribute) for (let vertex = 0; vertex < positionAttribute.count; vertex++) {
        const x = positionAttribute.getX(vertex), y = positionAttribute.getY(vertex), z = positionAttribute.getZ(vertex);
        minX = Math.min(minX, x); minY = Math.min(minY, y); minZ = Math.min(minZ, z);
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); maxZ = Math.max(maxZ, z);
      }
      const centerX = (minX + maxX) / 2, centerY = (minY + maxY) / 2, centerZ = (minZ + maxZ) / 2;
      let effectivelyVisible = true;
      for (let ancestor = object; ancestor; ancestor = ancestor.parent)
        effectivelyVisible &&= ancestor.visible;
      let matricesFinite = true;
      for (let i = 0; i < object.count; i++) {
        object.getMatrixAt(i, matrix);
        for (const value of matrix.elements) matricesFinite &&= Number.isFinite(value);
        const instance = matrix.elements, world = object.matrixWorld.elements;
        const localX = instance[0] * centerX + instance[4] * centerY + instance[8] * centerZ + instance[12];
        const localY = instance[1] * centerX + instance[5] * centerY + instance[9] * centerZ + instance[13];
        const localZ = instance[2] * centerX + instance[6] * centerY + instance[10] * centerZ + instance[14];
        const x = world[0] * localX + world[4] * localY + world[8] * localZ + world[12];
        const y = world[1] * localX + world[5] * localY + world[9] * localZ + world[13];
        const z = world[2] * localX + world[6] * localY + world[10] * localZ + world[14];
        const clipX = projection[0] * x + projection[4] * y + projection[8] * z + projection[12];
        const clipY = projection[1] * x + projection[5] * y + projection[9] * z + projection[13];
        const clipZ = projection[2] * x + projection[6] * y + projection[10] * z + projection[14];
        const clipW = projection[3] * x + projection[7] * y + projection[11] * z + projection[15];
        if (effectivelyVisible && clipW > 0 && Math.abs(clipX / clipW) <= 1 && Math.abs(clipY / clipW) <= 1 && Math.abs(clipZ / clipW) <= 1)
          visibleInstances++;
      }
      let attributesFinite = !!positionAttribute && !!uv && !!normal;
      for (const attribute of [positionAttribute, uv, normal]) {
        if (!attribute) continue;
        for (const value of attribute.array) attributesFinite &&= Number.isFinite(value);
      }
      return {
        name: object.name,
        material: material.name,
        geometryId: geometry.uuid,
        count: object.count,
        trianglesPerInstance: indexCount / 3,
        logicalTriangles: (indexCount / 3) * object.count,
        uv: !!uv,
        image: image ? { width: image.width || image.naturalWidth, height: image.height || image.naturalHeight } : null,
        attributesFinite,
        matricesFinite,
        visible: effectivelyVisible,
        object,
        geometry,
        material,
        texture: material.map,
      };
    });

    const ageOf = entry => /foal/i.test(entry.material.name) ? "foal" : /adult/i.test(entry.material.name) ? "adult" : "unknown";
    const identityOf = entry => entry.name.match(/^Plains zebra skin (adult|foal) (looking|grazing|walking)$/i);
    const byAge = Object.fromEntries(["adult", "foal"].map(age => {
      const selected = summaries.filter(entry => ageOf(entry) === age);
      return [age, {
        instances: selected.reduce((sum, entry) => sum + entry.count, 0),
        geometries: [...new Set(selected.map(entry => entry.geometryId))].length,
        maps: [...new Set(selected.map(entry => entry.texture))].length,
        poses: Object.fromEntries(["looking", "grazing", "walking"].map(pose => {
          const poseEntries = selected.filter(entry => identityOf(entry)?.[2] === pose);
          return [pose, {
            instances: poseEntries.reduce((sum, entry) => sum + entry.count, 0),
            maps: [...new Set(poseEntries.map(entry => entry.texture.uuid))],
          }];
        })),
      }];
    }));
    const allMapIdsByAge = Object.fromEntries(["adult", "foal"].map(age => [
      age,
      [...new Set(summaries.filter(entry => ageOf(entry) === age).map(entry => entry.texture.uuid))],
    ]));
    const beforeCounts = {
      renderCalls: game.renderer.info.render.calls,
      renderedTriangles: game.renderer.info.render.triangles,
      webglRenderer: (() => {
        const gl = game.renderer.getContext();
        const debug = gl.getExtension("WEBGL_debug_renderer_info");
        return debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      })(),
      visibleInstances,
      totalInstances: summaries.reduce((sum, entry) => sum + entry.count, 0),
      logicalTriangles: summaries.reduce((sum, entry) => sum + entry.logicalTriangles, 0),
      uniqueGeometries: [...new Set(summaries.map(entry => entry.geometryId))].length,
      templateNames: [...new Set(summaries.map(entry => entry.name))],
      byAge,
      allMapIdsByAge,
      templates: summaries.map(({ object, geometry, material, texture, ...summary }) => summary),
      ownedWorldGeometries: ownedGeometries.length,
      worldRootAttached: world.root.parent === game.scene,
    };

    const disposal = { instanceBuffers: 0, ownedGeometryBuffers: 0, sharedGeometry: 0, sharedMaterials: 0, sharedCoatMaps: 0 };
    for (const { object, material } of skinInstances) {
      object.addEventListener("dispose", () => disposal.instanceBuffers++);
      object.geometry.addEventListener("dispose", () => disposal.sharedGeometry++);
      material.addEventListener("dispose", () => disposal.sharedMaterials++);
      material.map.addEventListener("dispose", () => disposal.sharedCoatMaps++);
    }
    for (const geometry of ownedGeometries)
      geometry.addEventListener("dispose", () => disposal.ownedGeometryBuffers++);
    const oldWorld = world;
    game.setWorld(0);
    const afterSwitch = {
      oldWorldDetached: oldWorld.root.parent === null,
      newWorldId: game.world.level.id,
      disposal,
      templateGeometryStillValid: skinInstances.every(({ object }) =>
        object.geometry.attributes.position.count > 0 &&
        (object.geometry.index?.count ?? object.geometry.attributes.position.count) > 0),
      coatMapsStillLoaded: skinInstances.every(({ material }) =>
        material.map.image && (material.map.image.width || material.map.image.naturalWidth) > 0),
    };
    return { beforeCounts, afterSwitch };
  });
  expect(result.beforeCounts.worldRootAttached).toBe(true);
  expect(result.beforeCounts.renderCalls).toBeGreaterThan(0);
  expect(result.beforeCounts.renderedTriangles).toBeGreaterThan(0);
  expect(result.beforeCounts.totalInstances).toBeGreaterThanOrEqual(150);
  expect(result.beforeCounts.visibleInstances).toBeGreaterThan(0);
  expect(result.beforeCounts.logicalTriangles).toBeGreaterThan(0);
  expect(result.beforeCounts.uniqueGeometries).toBe(6);
  expect(result.beforeCounts.templateNames.sort()).toEqual([
    "Plains zebra skin adult grazing", "Plains zebra skin adult looking", "Plains zebra skin adult walking",
    "Plains zebra skin foal grazing", "Plains zebra skin foal looking", "Plains zebra skin foal walking",
  ]);
  expect(result.beforeCounts.byAge.adult.instances).toBeGreaterThan(0);
  expect(result.beforeCounts.byAge.foal.instances).toBeGreaterThan(0);
  expect(result.beforeCounts.byAge.adult.geometries).toBe(3);
  expect(result.beforeCounts.byAge.foal.geometries).toBe(3);
  expect(result.beforeCounts.byAge.adult.maps).toBe(2);
  expect(result.beforeCounts.byAge.foal.maps).toBe(2);
  for (const age of ["adult", "foal"]) {
    const poses = result.beforeCounts.byAge[age].poses;
    for (const pose of ["looking", "grazing", "walking"]) {
      expect(poses[pose].instances, `${age} ${pose} template is instanced`).toBeGreaterThan(0);
      expect(poses[pose].maps, `${age} ${pose} uses exactly one decoded coat map`).toHaveLength(1);
    }
    expect(poses.looking.maps[0]).toBe(poses.walking.maps[0]);
    expect(poses.grazing.maps[0]).not.toBe(poses.looking.maps[0]);
  }
  expect(result.beforeCounts.allMapIdsByAge.adult[0]).not.toBe(result.beforeCounts.allMapIdsByAge.foal[0]);
  expect(result.beforeCounts.ownedWorldGeometries).toBeGreaterThan(0);
  for (const template of result.beforeCounts.templates) {
    expect(template.count).toBeGreaterThan(0);
    expect(template.trianglesPerInstance).toBeGreaterThan(0);
    expect(template.uv).toBe(true);
    expect(template.attributesFinite).toBe(true);
    expect(template.matricesFinite).toBe(true);
    expect(template.image.width).toBeGreaterThan(0);
    expect(template.image.height).toBeGreaterThan(0);
  }
  expect(result.afterSwitch.oldWorldDetached).toBe(true);
  expect(result.afterSwitch.newWorldId).toBe(0);
  expect(result.afterSwitch.disposal.instanceBuffers).toBe(result.beforeCounts.templates.length);
  expect(result.afterSwitch.disposal.ownedGeometryBuffers).toBe(result.beforeCounts.ownedWorldGeometries);
  expect(result.afterSwitch.disposal.sharedGeometry).toBe(0);
  expect(result.afterSwitch.disposal.sharedMaterials).toBe(0);
  expect(result.afterSwitch.disposal.sharedCoatMaps).toBe(0);
  expect(result.afterSwitch.templateGeometryStillValid).toBe(true);
  expect(result.afterSwitch.coatMapsStillLoaded).toBe(true);
  expect(errors).toEqual([]);
});
