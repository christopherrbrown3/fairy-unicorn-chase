// Capture Big City Downtown in natural chase play, plus a settled full-friend
// finale and a representative original-world regression view.
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const base = process.env.CAPTURE_URL || "http://127.0.0.1:5173";
await mkdir("docs/screenshots", { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const errors = [];
const captures = [];

async function newPage(viewport, label) {
  const page = await browser.newPage({ viewport, hasTouch: true });
  page.on("pageerror", e => errors.push(`${label}: ${e.message}`));
  page.on("console", m => { if (m.type() === "error") errors.push(`${label}: ${m.text()}`); });
  page.on("response", r => { if (r.status() >= 400) errors.push(`${label}: ${r.status()} ${r.url()}`); });
  await page.goto(`${base}/?test=1`);
  await page.waitForFunction(() => window.__fairy?.screen === "title");
  await page.evaluate(() => document.fonts.ready);
  return page;
}

async function seedAllPriorFriends(page) {
  await page.evaluate(() => localStorage.setItem("fairy-unicorn-chase:v1", JSON.stringify({
    version: 1,
    completed: Array.from({ length: 17 }, (_, id) => id),
    sound: false,
    quality: "low",
    reducedMotion: true,
  })));
  await page.reload();
  await page.waitForFunction(() => window.__fairy?.screen === "title");
}

async function startDowntown(page) {
  await page.getByRole("button", { name: "Worlds", exact: true }).click();
  await page.getByRole("button", { name: "Big City Downtown", exact: true }).click();
  await page.getByRole("button", { name: "Pause game" }).waitFor();
}

async function naturalNearState(page) {
  let elapsed = 0;
  let state = await page.evaluate(() => ({ ...window.__fairy.snapshot(), screen: window.__fairy.screen, mode: window.__fairy.game.mode }));
  while (elapsed < 120 && state.distance > 18) {
    const step = state.distance > 32 ? 2 : 0.25;
    if (state.screen !== "playing" || state.mode !== "playing") break;
    await page.evaluate(seconds => window.__fairy.advance(seconds), step);
    elapsed += step;
    state = await page.evaluate(() => ({ ...window.__fairy.snapshot(), screen: window.__fairy.screen, mode: window.__fairy.game.mode }));
  }
  if (state.screen !== "playing" || state.mode !== "playing" || state.distance < 10 || state.distance > 18)
    throw new Error(`Metro not naturally visible in target distance window: ${JSON.stringify(state)}`);
  return { elapsed, state };
}

for (const { name, viewport } of [
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  { name: "ipad-landscape", viewport: { width: 1180, height: 820 } },
]) {
  const page = await newPage(viewport, name);
  await seedAllPriorFriends(page);
  await startDowntown(page);
  if (name === "desktop") {
    // This is an untouched normal-course opening, with the authored first
    // potion in front of the rider and no pickup/camera/target manipulation.
    await page.evaluate(() => window.__fairy.game.renderer.render(window.__fairy.game.scene, window.__fairy.game.camera));
    const potionPath = "docs/screenshots/downtown-potion-visible-ahead.jpg";
    await page.screenshot({ path: potionPath, type: "jpeg", quality: 90 });
    captures.push(potionPath);
  }
  const near = await naturalNearState(page);
  await page.evaluate(() => window.__fairy.game.renderer.render(window.__fairy.game.scene, window.__fairy.game.camera));
  const gameplayPath = `docs/screenshots/downtown-${name}-metro-near.jpg`;
  await page.screenshot({ path: gameplayPath, type: "jpeg", quality: 88 });
  captures.push(gameplayPath);
  console.log(JSON.stringify({ capture: gameplayPath, elapsed: near.elapsed, distance: near.state.distance, s: near.state.s, mode: near.state.mode }));

  await seedAllPriorFriends(page);
  await startDowntown(page);
  await page.evaluate(() => window.__fairy.advance(180));
  await page.getByRole("heading", { name: "All 18 friends!" }).waitFor();
  await page.evaluate(() => {
    const g = window.__fairy.game;
    g.setStageCamera(false, true);
    g.renderer.render(g.scene, g.camera);
  });
  await page.waitForTimeout(650);
  const finalePath = `docs/screenshots/downtown-finale-${name}.jpg`;
  await page.screenshot({ path: finalePath, type: "jpeg", quality: 88 });
  captures.push(finalePath);
  await page.close();
}

const meadow = await newPage({ width: 1440, height: 900 }, "meadow");
await meadow.evaluate(() => window.__fairy.start(0));
await meadow.evaluate(() => window.__fairy.advance(3));
await meadow.evaluate(() => window.__fairy.game.renderer.render(window.__fairy.game.scene, window.__fairy.game.camera));
await meadow.waitForTimeout(300);
const meadowPath = "docs/screenshots/downtown-meadow-preservation.jpg";
await meadow.screenshot({ path: meadowPath, type: "jpeg", quality: 88 });
captures.push(meadowPath);
await meadow.close();
await browser.close();
console.log(JSON.stringify({ captures, errors }));
if (errors.length) process.exitCode = 1;
