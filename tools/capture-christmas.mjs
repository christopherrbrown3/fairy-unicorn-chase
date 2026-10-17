// Capture Christmas Village in natural near-catch play and the settled finale.
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const base = process.env.CAPTURE_URL || "http://127.0.0.1:5173";
await mkdir("docs/screenshots", { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const errors = [];
async function pageFor(viewport, label) {
  const page = await browser.newPage({ viewport, hasTouch: true });
  page.on("pageerror", e => errors.push(`${label}: ${e.message}`));
  page.on("console", m => { if (m.type() === "error") errors.push(`${label}: ${m.text()}`); });
  page.on("response", r => { if (r.status() >= 400) errors.push(`${label}: ${r.status()} ${r.url()}`); });
  await page.goto(`${base}/?test=1`);
  await page.waitForFunction(() => window.__fairy?.screen === "title");
  return page;
}
async function seed(page) {
  await page.evaluate(() => localStorage.setItem("fairy-unicorn-chase:v1", JSON.stringify({
    version: 1, completed: Array.from({ length: 15 }, (_, id) => id),
    sound: false, quality: "low", reducedMotion: true,
  })));
  await page.reload();
  await page.waitForFunction(() => window.__fairy?.screen === "title");
}
async function openChristmas(page) {
  await page.getByRole("button", { name: "Worlds", exact: true }).click();
  await page.getByRole("button", { name: "Christmas Village", exact: true }).click();
  await page.getByRole("button", { name: "Pause game" }).waitFor();
}
const sizes = [
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  { name: "ipad-landscape", viewport: { width: 1180, height: 820 } },
];
const states = [];
for (const { name, viewport } of sizes) {
  const page = await pageFor(viewport, name);
  await seed(page);
  await openChristmas(page);
  // Advance the actual chase in ordinary-sized steps until Holly is naturally nearby.
  let state = await page.evaluate(() => window.__fairy.snapshot());
  let elapsed = 0;
  while (elapsed < 120 && (state.distance > 18 || state.distance < 10)) {
    const step = state.distance > 25 ? 4 : 0.5;
    await page.evaluate(step => window.__fairy.advance(step), step);
    elapsed += step;
    state = await page.evaluate(() => ({ ...window.__fairy.snapshot(), screen: window.__fairy.screen, mode: window.__fairy.game.mode }));
    if (state.screen !== "playing" || state.mode !== "playing") break;
  }
  if (state.screen !== "playing" || state.mode !== "playing" || state.distance < 10 || state.distance > 18)
    throw new Error(`${name}: Holly not naturally visible in target distance window: ${JSON.stringify(state)}`);
  states.push({ viewport: name, elapsed, s: state.s, distance: state.distance, mode: state.mode });
  await page.evaluate(() => { const g = window.__fairy.game; g.renderer.render(g.scene, g.camera); });
  await page.screenshot({ path: `docs/screenshots/christmas-village-${name}-holly-near.jpg`, type: "jpeg", quality: 88 });

  await seed(page);
  await openChristmas(page);
  await page.evaluate(() => window.__fairy.advance(180));
  await page.getByRole("heading", { name: "All 16 friends!" }).waitFor();
  await page.evaluate(() => { const g = window.__fairy.game; g.setStageCamera(false, true); g.renderer.render(g.scene, g.camera); });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `docs/screenshots/christmas-finale-${name}.jpg`, type: "jpeg", quality: 88 });
  await page.close();
}
const oldWorld = await pageFor({ width: 1440, height: 900 }, "meadow");
await oldWorld.evaluate(() => window.__fairy.start(0));
await oldWorld.evaluate(() => window.__fairy.advance(3));
await oldWorld.evaluate(() => { const g = window.__fairy.game; g.renderer.render(g.scene, g.camera); });
await oldWorld.waitForTimeout(350);
await oldWorld.screenshot({ path: "docs/screenshots/christmas-meadow-preservation.jpg", type: "jpeg", quality: 88 });
await oldWorld.close();
await browser.close();
console.log(JSON.stringify({ states, errors, captures: ["christmas-village-desktop-holly-near.jpg", "christmas-village-ipad-landscape-holly-near.jpg", "christmas-finale-desktop.jpg", "christmas-finale-ipad-landscape.jpg", "christmas-meadow-preservation.jpg"] }));
if (errors.length) process.exitCode = 1;
