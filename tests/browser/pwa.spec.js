import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, resolve } from "node:path";

const ready = async (page, { animate = true } = {}) => {
  await page.waitForFunction(() => window.__fairy?.screen === "title");
  if (!animate)
    await page.evaluate(() => window.__fairy.game.renderer.setAnimationLoop(null));
};
const renderAfterResize = (page) => page.evaluate(async () => {
  // Browser resize events update and clear the canvas before the next frame.
  // Wait for that event before drawing a frame for a viewport capture.
  await new Promise(requestAnimationFrame);
  window.__fairy.game.frame();
});
const offlineReady = (page) => page.evaluate(async () => {
  await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller)
    await new Promise((done) => navigator.serviceWorker.addEventListener("controllerchange", done, { once: true }));
});

test("share metadata is in the raw HTML and install icons resolve at both hosting paths", async ({ request }) => {
  for (const base of ["/", "/fairy-unicorn-chase/"]) {
    const html = await (await request.get(base)).text();
    expect(html).toContain('property="og:description"');
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
    expect(html).toContain('property="og:image:width" content="1200"');
    expect(html).toContain('property="og:image:height" content="630"');
    expect(html).toContain('property="og:image" content="https://fuc.christopherbrown.ai/share/fairy-unicorn-chase.jpg"');
    const manifestResponse = await request.get(`${base}manifest.webmanifest`);
    expect(manifestResponse.headers()["content-type"]).toContain("application/manifest+json");
    const manifest = await manifestResponse.json();
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("./");
    expect(manifest.scope).toBe("./");
    expect(manifest.id).toBe("./");
    for (const entry of [...manifest.icons, { src: "./apple-touch-icon.png", sizes: "180x180" }]) {
      const response = await request.get(`${base}${entry.src.slice(2)}`);
      expect(response.ok()).toBe(true);
      const bytes = await response.body();
      expect(`${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`).toBe(entry.sizes);
    }
    const image = await request.get(`${base}share/fairy-unicorn-chase.jpg`);
    expect(image.ok()).toBe(true);
    expect(image.headers()["content-type"]).toContain("image/jpeg");
  }
});

for (const base of ["/", "/fairy-unicorn-chase/"]) {
  test(`a cold offline launch loads the complete game and saved progress at ${base}`, async ({ browser }) => {
    // Budget two independent WebGL startups, precaching and GPU teardown.
    test.setTimeout(180_000);
    const context = await browser.newContext();
    let page = await context.newPage();
    const errors = [];
    context.on("page", (p) => p.on("pageerror", (e) => errors.push(e.message)));
    try {
      await page.goto(`http://127.0.0.1:4173${base}?test=1`);
      await ready(page, { animate: false });
      await offlineReady(page);
      await page.evaluate(() => {
        localStorage.setItem("fairy-unicorn-chase:v1", JSON.stringify({ version: 1, completed: [0], sound: false, quality: "low", reducedMotion: true }));
      });
      await page.getByRole("button", { name: "Add to Home Screen" }).click();
      await expect(page.getByText("Ready for offline adventures.", { exact: false })).toBeVisible();
      await page.close();
      await context.setOffline(true);
      page = await context.newPage();
      await page.goto(`http://127.0.0.1:4173${base}?test=1&offline=1`);
      await ready(page, { animate: false });
      await page.getByRole("button", { name: "Keep playing", exact: true }).click();
      // Draw the offline scene once without continuously rendering the canvas
      // while storage, cache, font and menu assertions run.
      await page.evaluate(() => window.__fairy.game.frame());
      expect(await page.evaluate(() => window.__fairy.game.level.id)).toBe(1);
      expect(await page.evaluate(() => window.__fairy.save.completed)).toEqual([0]);
      expect(await page.evaluate(() => document.fonts.check("20px Baloo"))).toBe(true);
      expect(await page.evaluate(() => window.__fairy.game.world.potions[0].children[0].children.some((o) => o.name.includes("rounded")))).toBe(true);
      await page.getByRole("button", { name: "Pause game" }).click();
      await page.getByRole("button", { name: "Home", exact: true }).click();
      await page.getByRole("button", { name: "Worlds", exact: true }).click();
      await page.getByRole("button", { name: "Enchanted Forest", exact: true }).click();
      await expect(page.getByRole("button", { name: "Steer left" })).toBeVisible();
      expect(errors).toEqual([]);
    } finally {
      await context.close();
    }
  });
}

test("installation instructions and the browser install prompt are reachable", async ({ page, browserName }) => {
  // Four rendered viewport captures can take most of three minutes on a slow
  // software GPU; leave time for the install assertions and final navigation.
  test.setTimeout(300_000);
  const startedAt = Date.now();
  const logStage = (stage) => console.log(`[PWA install] ${stage}: ${Date.now() - startedAt}ms elapsed`);
  await page.goto("/?test=1");
  await ready(page, { animate: false });
  logStage("title ready");
  await page.getByRole("button", { name: "New game", exact: true }).click();
  await page.evaluate(() => window.dispatchEvent(new Event("beforeinstallprompt", { cancelable: true })));
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: "Add to Home Screen" }).click();
  await expect(page.getByRole("heading", { name: "Keep the magic close" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "iPhone & iPad" })).toBeVisible();
  logStage("install instructions ready");
  if (browserName === "chromium") {
    await mkdir("output/playwright/pwa", { recursive: true });
    for (const [name, viewport] of [["tablet", { width: 1024, height: 768 }], ["phone", { width: 390, height: 844 }]]) {
      await page.getByRole("button", { name: "Back", exact: true }).click();
      await page.setViewportSize(viewport);
      await renderAfterResize(page);
      logStage(`${name} title capture ready`);
      await page.screenshot({ path: `output/playwright/pwa/title-${name}.png`, animations: "disabled" });
      logStage(`${name} title captured`);
      await page.getByRole("button", { name: "Add to Home Screen" }).click();
      await page.evaluate(() => window.__fairy.game.frame());
      logStage(`${name} install capture ready`);
      await page.screenshot({ path: `output/playwright/pwa/install-${name}.png`, animations: "disabled" });
      logStage(`${name} install captured`);
    }
  }
  await page.evaluate(() => {
    const event = new Event("beforeinstallprompt", { cancelable: true });
    event.prompt = async () => { window.installPromptShown = true; };
    event.userChoice = Promise.resolve({ outcome: "accepted" });
    window.dispatchEvent(event);
  });
  logStage("install prompt ready");
  await page.getByRole("button", { name: "Install game", exact: true }).click();
  await expect(page.getByText("The game is installed.", { exact: false })).toBeVisible();
  expect(await page.evaluate(() => window.installPromptShown)).toBe(true);
  logStage("install prompt completed");
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByRole("button", { name: "Add to Home Screen" })).toHaveCount(0);
});

test("new releases wait for a menu action, preserve saves across tabs, and survive a failed update", async ({ page, context, browserName }) => {
  // This lifecycle covers two tabs, three update reloads and a cold offline
  // startup. Keep time for all of them on the slower hosted software renderer.
  test.setTimeout(300_000);
  let release = "old";
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".glb": "model/gltf-binary", ".png": "image/png", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json" };
  const root = resolve("dist");
  // Serve immutable old/new deployment fixtures without mutating the build.
  const server = createServer(async (req, res) => {
    try {
      const path = new URL(req.url, "http://localhost").pathname;
      const file = resolve(root, `.${path === "/" ? "/index.html" : path}`);
      if (!file.startsWith(`${root}/`)) throw Error("Outside root");
      let body = await readFile(file);
      if (file.endsWith("sw.js")) {
        body = body.toString().replace(/(const CACHE = `\$\{PREFIX\}[a-f0-9]+)(`)/, `$1-${release}$2`);
        if (release === "broken") body = body.replace("const FILES = [", 'const FILES = ["missing-offline-file.png",');
      }
      if (file.endsWith("index.html")) body = body.toString().replace("</head>", `<meta name="test-release" content="${release}" /></head>`);
      res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  const url = `http://127.0.0.1:${server.address().port}/?test=1`;
  await context.addInitScript(() => {
    try {
      if (!localStorage.getItem("fairy-unicorn-chase:v1"))
        localStorage.setItem("fairy-unicorn-chase:v1", JSON.stringify({ version: 1, completed: [0], sound: false, quality: "low", reducedMotion: true }));
    } catch { /* The initial about:blank document has no storage origin. */ }
  });
  try {
    console.log("PWA update: opening old release");
    await page.setViewportSize({ width: 640, height: 480 });
    await page.goto(url);
    await ready(page, { animate: false });
    // The lifecycle test uses real game state, but does not need two continuous
    // software-GPU render loops while another WebGL scene initializes.
    await offlineReady(page);
    console.log("PWA update: old release is cached");
    await page.evaluate(async () => {
      const cache = await caches.open("unrelated-app");
      await cache.put("/unrelated", new Response("keep me"));
    });
    const other = await context.newPage();
    await other.setViewportSize({ width: 640, height: 480 });
    await other.goto(url);
    await ready(other, { animate: false });
    await other.getByRole("button", { name: "Keep playing", exact: true }).click();
    await page.getByRole("button", { name: "Keep playing", exact: true }).click();
    console.log("PWA update: both copies are playing");
    release = "new";
    // Returning online triggers the same check used by an installed app.
    await page.evaluate(() => window.dispatchEvent(new Event("online")));
    await page.waitForFunction(async () => Boolean((await navigator.serviceWorker.getRegistration()).waiting));
    console.log("PWA update: new release is waiting");
    expect(await page.locator('meta[name="test-release"]').getAttribute("content")).toBe("old");
    await expect(page.getByRole("button", { name: "Update game", exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => window.__fairy.screen)).toBe("playing");
    await page.getByRole("button", { name: "Pause game" }).click();
    await expect(page.getByRole("button", { name: "Update game", exact: true })).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await renderAfterResize(page);
    await mkdir("output/playwright/pwa", { recursive: true });
    if (browserName === "chromium") {
      await page.screenshot({ path: "output/playwright/pwa/update-phone.png", animations: "disabled" });
      await page.setViewportSize({ width: 1024, height: 768 });
      await renderAfterResize(page);
      await page.screenshot({ path: "output/playwright/pwa/update-tablet.png", animations: "disabled" });
    }
    await page.getByRole("button", { name: "Update game", exact: true }).click();
    await expect(page.locator('meta[name="test-release"]')).toHaveAttribute("content", "new");
    await ready(page, { animate: false });
    console.log("PWA update: first copy has updated");
    expect(await page.evaluate(() => window.__fairy.save)).toMatchObject({ completed: [0], sound: false, quality: "low", reducedMotion: true });
    expect(await page.evaluate(() => caches.has("unrelated-app"))).toBe(true);
    await page.getByRole("button", { name: "Keep playing", exact: true }).click();
    await page.evaluate(() => window.__fairy.advance(240));
    expect(await page.evaluate(() => window.__fairy.save.completed)).toEqual([0, 1]);
    expect(await other.locator('meta[name="test-release"]').getAttribute("content")).toBe("old");
    expect(await other.evaluate(() => window.__fairy.screen)).toBe("playing");
    await other.getByRole("button", { name: "Pause game" }).click();
    await other.getByRole("button", { name: "Home", exact: true }).click();
    if (browserName === "chromium") {
      await other.setViewportSize({ width: 1024, height: 768 });
      await renderAfterResize(other);
      await other.screenshot({ path: "output/playwright/pwa/update-title-tablet.png", animations: "disabled" });
    }
    await other.getByRole("button", { name: "Update game", exact: true }).click();
    await expect(other.locator('meta[name="test-release"]')).toHaveAttribute("content", "new");
    await ready(other, { animate: false });
    console.log("PWA update: second copy has updated");
    expect(await other.evaluate(() => window.__fairy.save.completed)).toEqual([0, 1]);
    await other.close();
    release = "broken";
    const failedState = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      const failed = new Promise((done) => reg.addEventListener("updatefound", () => {
        const worker = reg.installing;
        worker.addEventListener("statechange", () => {
          if (worker.state === "redundant") done(worker.state);
        });
      }, { once: true }));
      await reg.update();
      return failed;
    });
    expect(failedState).toBe("redundant");
    console.log("PWA update: incomplete release was rejected");
    await expect(page.getByRole("button", { name: "Update game", exact: true })).toHaveCount(0);
    expect(await page.evaluate(async () => (await caches.keys()).filter((name) => name.startsWith("fairy-unicorn-chase:")).length)).toBe(1);
    await context.setOffline(true);
    await page.reload();
    await ready(page, { animate: false });
    await expect(page.locator('meta[name="test-release"]')).toHaveAttribute("content", "new");
    expect(await page.evaluate(() => window.__fairy.save.completed)).toEqual([0, 1]);
  } finally {
    await context.setOffline(false);
    await new Promise((done) => server.close(done));
  }
});
