import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { LEVELS } from "../../src/config/levels.js";
const ready = async (page, { animate = true } = {}) => {
  await page.waitForFunction(
    () => window.__fairy?.game && window.__fairy?.screen === "title",
  );
  // State scenarios advance the real simulation explicitly. Keep the software
  // GPU free between those actions; input and visual scenarios still animate.
  if (!animate)
    await page.evaluate(() => window.__fairy.game.renderer.setAnimationLoop(null));
};
const snap = (page) => page.evaluate(() => window.__fairy.snapshot());
const seedFullProgress = async (page) => {
  await page.evaluate((completedCount) => {
    localStorage.setItem(
      "fairy-unicorn-chase:v1",
      JSON.stringify({
        version: 1,
        completed: Array.from({ length: completedCount }, (_, id) => id),
        sound: false,
        quality: "low",
        reducedMotion: true,
      }),
    );
    localStorage.setItem("new-game-unrelated", "keep this value");
  }, LEVELS.length - 1);
  await page.reload();
  await ready(page, { animate: false });
};
test("root and repository subpath render authored assets without errors", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  for (const path of ["/?test=1", "/fairy-unicorn-chase/?test=1"]) {
    await page.goto(path);
    await ready(page);
    await expect(
      page.getByRole("button", { name: "Let’s play" }),
    ).toBeVisible();
    const art = await page.evaluate(() => {
      const g = window.__fairy.game;
      return {
        mia: g.player.userData.mia.name,
        pony: g.player.name,
        unicorn: g.unicorn.name,
        bottle: g.world.potions[0].children[0].children.map((o) => o.name),
        triangles: g.renderer.info.render.triangles,
      };
    });
    expect(art.mia).toBe("Mia");
    expect(art.pony).toBe("Glender");
    expect(art.unicorn).toBe("White unicorn");
    expect(art.bottle.some((n) => n.includes("rounded"))).toBe(true);
    expect(art.triangles).toBeGreaterThan(1000);
  }
  expect(errors).toEqual([]);
});
test("keyboard, held touch controls, multitouch water, pause and preferences", async ({
  page,
  browserName,
}) => {
  // Exercise every input and preference with the render loop running. Allow
  // software-GPU runners time for the complete sequence, not only startup.
  test.setTimeout(180_000);
  await page.goto("/?test=1");
  await ready(page);
  await page.getByRole("button", { name: "Let’s play" }).click();
  const advanceInput = (seconds) =>
    page.evaluate((seconds) => {
      const f = window.__fairy;
      f.advance(seconds, f.game.steer);
    }, seconds);
  const screenX = () =>
    page.evaluate(() => {
      const g = window.__fairy.game,
        p = g.player.position.clone();
      p.y += 1.5;
      return p.project(g.camera).x;
    });
  const centerX = await screenX();
  await page.keyboard.down("ArrowLeft");
  expect(await page.evaluate(() => window.__fairy.game.steer)).toBe(-1);
  await advanceInput(0.5);
  expect((await snap(page)).lane).toBeLessThan(-2);
  expect(await screenX()).toBeLessThan(centerX - 0.1);
  await page.keyboard.up("ArrowLeft");
  await advanceInput(1);
  expect(Math.abs((await snap(page)).lane)).toBeLessThan(0.2);
  await page.keyboard.down("d");
  expect(await page.evaluate(() => window.__fairy.game.steer)).toBe(1);
  await advanceInput(0.5);
  expect((await snap(page)).lane).toBeGreaterThan(2);
  expect(await screenX()).toBeGreaterThan(centerX + 0.1);
  await page.keyboard.up("d");
  const left = await page.locator("#left").boundingBox();
  await page.mouse.move(left.x + left.width / 2, left.y + left.height / 2);
  await page.mouse.down();
  await advanceInput(0.5);
  expect((await snap(page)).lane).toBeLessThan(-2);
  await page.keyboard.press("Space");
  await expect
    .poll(async () => (await snap(page)).stats.sprays)
    .toBeGreaterThan(0);
  await page.mouse.up();
  await advanceInput(0.5);
  await page.getByRole("button", { name: "Spray water" }).tap();
  await expect
    .poll(async () => (await snap(page)).stats.sprays)
    .toBeGreaterThan(1);
  if (browserName === "chromium") {
    await advanceInput(0.5);
    const water = await page.locator("#water").boundingBox(),
      cdp = await page.context().newCDPSession(page);
    const points = [
      { x: left.x + left.width / 2, y: left.y + left.height / 2, id: 1 },
      { x: water.x + water.width / 2, y: water.y + water.height / 2, id: 2 },
    ];
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: points,
    });
    await advanceInput(0.5);
    expect((await snap(page)).lane).toBeLessThan(-2);
    await expect
      .poll(async () => (await snap(page)).stats.sprays)
      .toBeGreaterThan(2);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await cdp.detach();
  }
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "A little breather" }),
  ).toBeVisible();
  const before = await snap(page);
  await page.waitForTimeout(300);
  expect((await snap(page)).s).toBe(before.s);
  await page.getByRole("button", { name: "Sound on" }).click();
  await page.getByLabel("Picture quality").selectOption("low");
  await page.getByLabel("Gentle motion").check();
  expect(await page.evaluate(() => window.__fairy.save.sound)).toBe(false);
  expect(await page.evaluate(() => window.__fairy.save.quality)).toBe("low");
  await page.getByRole("button", { name: "Keep chasing" }).click();
  await expect(page.getByRole("button", { name: "Steer right" })).toBeVisible();
});
test("real potion speed, automatic jump and harmless collision work in rendered game", async ({
  page,
}) => {
  await page.goto("/?test=1");
  await ready(page);
  await page.getByRole("button", { name: "Let’s play" }).click();
  await page.evaluate(() => window.__fairy.advance(3.4));
  let c = await snap(page);
  expect(c.stats.potions).toBeGreaterThan(0);
  expect(c.speed).toBeGreaterThan(12);
  await page.evaluate((completedCount) => {
    const g = window.__fairy.game;
    const item = g.state.items.find(
      (o) => o.kind === "puddle" || o.kind === "log",
    );
    g.state.s = item.s - 3;
    g.state.lane = item.lane;
    g.state.unicornS = g.state.s + 50;
    g.state.step(0.05, g.state.lane / g.level.width / 0.39);
  });
  expect((await snap(page)).stats.jumps).toBeGreaterThan(0);
  await page.evaluate(() => {
    const c = window.__fairy.game.state;
    const item = c.items.find((o) => o.kind === "tree");
    c.s = item.s - 1;
    c.lane = item.lane;
    c.unicornS = c.s + 50;
    c.step(0.05, c.lane / c.level.width / 0.39);
  });
  expect((await snap(page)).stats.bumps).toBeGreaterThan(0);
});
test("all real chases unlock friends, continue, finale and reload persistence", async ({
  page,
}) => {
  // This scenario builds all worlds and reloads the saved collection.
  // Software WebGL on CI needs more time than a single-world interaction.
  test.setTimeout(180000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/?test=1");
  await ready(page, { animate: false });
  await page.getByRole("button", { name: "Worlds", exact: true }).click();
  expect(await page.locator(".world-tile:disabled").count()).toBe(LEVELS.length - 1);
  await page
    .getByRole("button", { name: "Rainbow Meadow", exact: true })
    .click();
  for (let i = 0; i < LEVELS.length; i++) {
    await page.evaluate(() => window.__fairy.advance(180));
    expect((await snap(page)).caught).toBe(true);
    expect((await snap(page)).distance).toBeLessThanOrEqual(3.8);
    expect(
      await page.evaluate(() => window.__fairy.save.completed.length),
    ).toBe(i + 1);
    if (i < LEVELS.length - 1)
      await page.getByRole("button", { name: "Continue", exact: true }).click();
  }
  await expect(
    page.getByRole("heading", { name: `All ${LEVELS.length} friends!` }),
  ).toBeVisible();
  expect(await page.evaluate(() => window.__fairy.game.friends.length)).toBe(
    LEVELS.length,
  );
  expect(
    await page.evaluate(() => {
      const g = window.__fairy.game;
      // Exercise the complete family on the GPU once before checking its stage.
      g.frame();
      return !g.world.root.visible && !!g.celebrationArt && g.player.visible;
    }),
  ).toBe(true);
  await page.getByRole("button", { name: "Our unicorns" }).click();
  expect(await page.locator(".collection-tile.found").count()).toBe(LEVELS.length);
  await page.reload();
  await ready(page, { animate: false });
  expect(await page.evaluate(() => window.__fairy.save.completed.length)).toBe(
    LEVELS.length,
  );
  await page.getByRole("button", { name: "Worlds", exact: true }).click();
  expect(await page.locator(".world-tile:disabled").count()).toBe(0);
  expect(errors).toEqual([]);
});

test("previous release save unlocks the newest world without losing progress or preferences", async ({ page }) => {
  // Three cold WebGL startups plus the full family scene on the software GPU.
  test.setTimeout(180_000);
  await page.goto("/?test=1");
  await ready(page, { animate: false });
  await page.evaluate((completedCount) => {
    localStorage.setItem(
      "fairy-unicorn-chase:v1",
      JSON.stringify({
        version: 1,
        completed: Array.from({ length: completedCount }, (_, id) => id),
        sound: false,
        quality: "low",
        reducedMotion: true,
      }),
    );
    localStorage.setItem("migration-unrelated", "keep this value");
  }, LEVELS.length - 1);
  await page.reload();
  await ready(page, { animate: false });
  expect(await page.evaluate(() => window.__fairy.save.completed)).toEqual(
    Array.from({ length: LEVELS.length - 1 }, (_, id) => id),
  );
  expect(await page.evaluate(() => window.__fairy.save)).toMatchObject({
    sound: false,
    quality: "low",
    reducedMotion: true,
  });
  await page.getByRole("button", { name: "Worlds", exact: true }).click();
  await expect(page.getByRole("button", { name: LEVELS.at(-1).name, exact: true })).toBeEnabled();
  expect(await page.locator(".world-tile:disabled").count()).toBe(0);
  await page.getByRole("button", { name: LEVELS.at(-1).name, exact: true }).click();
  expect(await page.evaluate(() => window.__fairy.game.level.id)).toBe(LEVELS.length - 1);
  expect(await page.evaluate(() => window.__fairy.save.completed.length)).toBe(LEVELS.length - 1);
  await page.evaluate(() => window.__fairy.advance(180));
  await expect(
    page.getByRole("heading", { name: `All ${LEVELS.length} friends!` }),
  ).toBeVisible();
  expect(await page.evaluate(() => window.__fairy.game.friends.length)).toBe(LEVELS.length);
  expect(await page.evaluate(() => window.__fairy.save.completed.length)).toBe(LEVELS.length);
  expect(await page.evaluate(() => window.__fairy.save)).toMatchObject({
    sound: false,
    quality: "low",
    reducedMotion: true,
  });
  await page.getByRole("button", { name: "Our unicorns" }).click();
  await expect(page.locator(".collection-tile.found")).toHaveCount(LEVELS.length);
  await page.reload();
  await ready(page, { animate: false });
  expect(await page.evaluate(() => window.__fairy.save.completed.length)).toBe(LEVELS.length);
  await page.getByRole("button", { name: "Worlds", exact: true }).click();
  await expect(page.locator(".world-tile:disabled")).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("migration-unrelated"))).toBe("keep this value");
});
test("portrait hint, large targets and corrupt storage recover", async ({
  page,
}) => {
  await page.goto("/?test=1");
  await ready(page);
  await page.evaluate(() =>
    localStorage.setItem("fairy-unicorn-chase:v1", "{broken"),
  );
  await page.reload();
  await ready(page);
  expect(await page.evaluate(() => window.__fairy.save.completed.length)).toBe(
    0,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByLabel("Landscape orientation hint")).toBeVisible();
  await page.getByRole("button", { name: "Let’s play" }).click();
  for (const id of ["left", "right", "water"]) {
    const bounds = await page.locator("#" + id).boundingBox();
    expect(bounds.width).toBeGreaterThanOrEqual(80);
    expect(bounds.height).toBeGreaterThanOrEqual(80);
  }
});

test("new game cancellation and confirmation preserve only the intended state", async ({
  page,
  browserName,
}) => {
  // This workflow reloads three times in addition to exercising both dialogs.
  test.setTimeout(180_000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });

  await page.goto("/?test=1");
  await ready(page, { animate: false });
  await seedFullProgress(page);
  const readStorage = () =>
    page.evaluate(() => ({
      save: JSON.parse(localStorage.getItem("fairy-unicorn-chase:v1")),
      unrelated: localStorage.getItem("new-game-unrelated"),
    }));
  const original = await readStorage();
  const opener = page.getByRole("button", { name: "New game", exact: true });

  // Space remains the native button activation key on the title menu and dialog.
  await opener.focus();
  await page.keyboard.press("Space");
  const dialog = page.getByRole("dialog", { name: "Start a new adventure?" });
  await expect(dialog).toBeVisible();
  const cancel = page.getByRole("button", { name: "Cancel" });
  const confirm = page.getByRole("button", { name: "Start new game" });
  await expect(cancel).toBeFocused();
  await page.keyboard.press("Space");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
  expect(await readStorage()).toEqual(original);
  expect(await page.evaluate(() => window.__fairy.screen)).toBe("title");

  // A real touch cancellation works for the primary young-player input mode.
  await opener.tap();
  await cancel.tap();
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
  expect(await readStorage()).toEqual(original);
  expect(await page.evaluate(() => window.__fairy.screen)).toBe("title");

  // Escape cancels too, restores focus to the same opener, and leaves the save intact.
  await opener.click();
  await expect(cancel).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
  expect(await readStorage()).toEqual(original);
  expect(await page.evaluate(() => window.__fairy.screen)).toBe("title");

  // Enter also opens the native menu button and its modal keeps the background inert.
  await opener.focus();
  await page.keyboard.press("Enter");
  await expect(cancel).toBeFocused();
  await opener.focus();
  await expect(opener).not.toBeFocused();
  await expect(cancel).toBeFocused();
  if (browserName === "chromium") {
    // Chromium cycles the two dialog buttons once, then Tab crosses to browser chrome.
    await page.keyboard.press("Tab");
    await expect(confirm).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(dialog).toBeVisible();
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe("BODY");
    await opener.focus();
    await expect(opener).not.toBeFocused();
    await expect(dialog).toBeVisible();
  }
  await confirm.focus();
  await expect(confirm).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "Pause game" })).toBeFocused();
  await expect(page.getByText("Rainbow Meadow", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.__fairy.screen)).toBe("playing");
  expect(await page.evaluate(() => window.__fairy.game.level.id)).toBe(0);
  expect(await page.evaluate(() => window.__fairy.save)).toMatchObject({
    completed: [],
    sound: false,
    quality: "low",
    reducedMotion: true,
  });
  expect((await readStorage()).save.completed).toEqual([]);
  expect((await readStorage()).unrelated).toBe("keep this value");

  // A pause-origin cancellation leaves the same chase paused and restores its opener.
  await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { name: "A little breather" })).toBeVisible();
  const pausedAt = await page.evaluate(() => window.__fairy.game.state.s);
  const pauseOpener = page.getByRole("button", { name: "New game" });
  await pauseOpener.focus();
  await page.keyboard.press("Space");
  await expect(dialog).toBeVisible();
  await expect(cancel).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(pauseOpener).toBeFocused();
  expect(await page.evaluate(() => window.__fairy.screen)).toBe("paused");
  expect(await page.evaluate(() => window.__fairy.game.mode)).toBe("paused");
  expect(await page.evaluate(() => window.__fairy.game.state.s)).toBe(pausedAt);

  // Confirming from pause resets only progress, persists the clear save and starts world 0.
  await page.keyboard.press("Enter");
  await expect(dialog).toBeVisible();
  await expect(cancel).toBeFocused();
  await confirm.tap();
  await expect(page.getByRole("button", { name: "Pause game" })).toBeFocused();
  expect(await page.evaluate(() => window.__fairy.screen)).toBe("playing");
  expect(await page.evaluate(() => window.__fairy.game.level.id)).toBe(0);
  expect(await page.evaluate(() => window.__fairy.save.completed)).toEqual([]);

  await page.reload();
  await ready(page, { animate: false });
  expect(await page.evaluate(() => window.__fairy.save)).toMatchObject({
    completed: [],
    sound: false,
    quality: "low",
    reducedMotion: true,
  });
  expect((await readStorage()).unrelated).toBe("keep this value");
  await page.getByRole("button", { name: "Worlds", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Rainbow Meadow", exact: true }),
  ).toBeEnabled();
  expect(await page.locator(".world-tile:disabled").count()).toBe(
    LEVELS.length - 1,
  );
  expect(errors).toEqual([]);
});

for (const viewport of [
  { name: "tablet", width: 1024, height: 768 },
  { name: "short-landscape", width: 844, height: 390 },
  { name: "portrait", width: 390, height: 844 },
]) {
  test(`new game menus and confirmation fit ${viewport.name}`, async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "One visual capture set is sufficient.");
    test.setTimeout(180_000);
    const startedAt = Date.now();
    const reportStage = (stage) => {
      console.log(`[responsive ${viewport.name}] ${stage}: ${Date.now() - startedAt}ms elapsed`);
    };
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("response", (r) => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
    });
    const output = resolve(".impeccable/review/new-game");
    await mkdir(output, { recursive: true });
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/?test=1");
    await ready(page);
    reportStage("initial ready");
    await page.evaluate(() => {
      localStorage.setItem(
        "fairy-unicorn-chase:v1",
        JSON.stringify({
          version: 1,
          completed: [0, 1, 2],
          sound: false,
          quality: "low",
          reducedMotion: true,
        }),
      );
      localStorage.setItem("new-game-unrelated", "keep this value");
    });
    await page.reload();
    await ready(page);
    reportStage("save reload ready");
    await expect(page.getByRole("button", { name: "New game" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Turn sound on" })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBe(true);
    for (const name of ["Worlds", "Unicorns"]) {
      const bounds = await page.getByRole("button", { name, exact: true }).boundingBox();
      expect(bounds.y).toBeGreaterThanOrEqual(0);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height);
    }
    await page.screenshot({
      path: resolve(output, `menu-${viewport.name}.png`),
      animations: "disabled",
    });
    reportStage("menu screenshot");

    await page.getByRole("button", { name: "New game" }).click();
    const dialog = page.getByRole("dialog", { name: "Start a new adventure?" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeFocused();
    const dialogBounds = await dialog.boundingBox();
    expect(dialogBounds.x).toBeGreaterThanOrEqual(0);
    expect(dialogBounds.y).toBeGreaterThanOrEqual(0);
    expect(dialogBounds.x + dialogBounds.width).toBeLessThanOrEqual(viewport.width);
    expect(dialogBounds.y + dialogBounds.height).toBeLessThanOrEqual(viewport.height);
    await page.screenshot({
      path: resolve(output, `confirmation-${viewport.name}.png`),
      animations: "disabled",
    });
    reportStage("confirmation screenshot");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "New game" })).toBeFocused();

    if (viewport.name !== "portrait") {
      await page.getByRole("button", { name: "Keep playing" }).click();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("heading", { name: "A little breather" })).toBeVisible();
      await expect(page.getByRole("button", { name: "New game" })).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      ).toBe(true);
      reportStage("pause ready");
      await page.screenshot({
        path: resolve(output, `pause-${viewport.name}.png`),
        animations: "disabled",
      });
      reportStage("pause screenshot");
    }
    expect(errors).toEqual([]);
  });
}

test("new game explains when cleared progress cannot be saved", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/?test=1");
  await ready(page);
  await seedFullProgress(page);
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "fairy-unicorn-chase:v1") throw new DOMException("blocked", "SecurityError");
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.getByRole("button", { name: "New game", exact: true }).click();
  await page.getByRole("button", { name: "Start new game" }).tap();
  await expect(page.locator("#notice")).toHaveText(
    "Progress can’t be saved in this browser. You can still play!",
  );
  expect(await page.evaluate(() => window.__fairy.screen)).toBe("playing");
  expect(await page.evaluate(() => window.__fairy.game.level.id)).toBe(0);
  expect(await page.evaluate(() => window.__fairy.save.completed)).toEqual([]);
  expect(errors).toEqual([]);
});
