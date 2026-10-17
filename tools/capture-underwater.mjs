// Capture Coral Lagoon at desktop and iPad landscape sizes, plus an old-world
// atmosphere regression image and the settled fifteen-friend finale.
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const base = process.env.CAPTURE_URL || "http://127.0.0.1:5173";
await mkdir("docs/screenshots", { recursive: true });
const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const errors = [];

async function pageFor(viewport, label) {
  const page = await browser.newPage({ viewport, hasTouch: true });
  page.on("pageerror", (e) => errors.push(`${label}: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`${label}: ${m.text()}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${label}: ${r.status()} ${r.url()}`);
  });
  await page.goto(`${base}/?test=1`);
  await page.waitForFunction(() => window.__fairy?.screen === "title");
  return page;
}

async function seedPreviousRelease(page) {
  await page.evaluate(() => {
    localStorage.setItem("fairy-unicorn-chase:v1", JSON.stringify({
      version: 1,
      completed: Array.from({ length: 14 }, (_, id) => id),
      sound: false,
      quality: "low",
      reducedMotion: true,
    }));
  });
  await page.reload();
  await page.waitForFunction(() => window.__fairy?.screen === "title");
}

const desktop = await pageFor({ width: 1440, height: 900 }, "desktop");
await desktop.evaluate(() => window.__fairy.start(0));
await desktop.evaluate(() => window.__fairy.advance(3));
await desktop.evaluate(() => {
  const g = window.__fairy.game;
  g.renderer.render(g.scene, g.camera);
});
await desktop.waitForTimeout(350);
await desktop.screenshot({ path: "docs/screenshots/coral-meadow-preservation.jpg", type: "jpeg", quality: 88 });
await desktop.close();

const captures = [
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  { name: "ipad-landscape", viewport: { width: 1180, height: 820 } },
];
const gameplayStates = [];

for (const capture of captures) {
  const page = await pageFor(capture.viewport, capture.name);
  await seedPreviousRelease(page);
  await page.getByRole("button", { name: "Worlds", exact: true }).click();
  await page.getByRole("button", { name: "Coral Lagoon", exact: true }).click();
  await page.getByRole("button", { name: "Pause game" }).waitFor();
  await page.evaluate(() => window.__fairy.advance(72));
  const state = await page.evaluate(() => ({
    screen: window.__fairy.screen,
    mode: window.__fairy.game.mode,
    ...window.__fairy.snapshot(),
  }));
  gameplayStates.push({ viewport: capture.name, time: state.time, distance: state.distance, s: state.s, mode: state.mode });
  if (state.screen !== "playing" || state.mode !== "playing" || state.distance < 5 || state.distance > 20)
    throw new Error(`${capture.name}: Pearl did not reach the expected natural near-catch state: ${JSON.stringify(state)}`);
  await page.evaluate(() => {
    const g = window.__fairy.game;
    g.renderer.render(g.scene, g.camera);
  });
  await page.screenshot({
    path: `docs/screenshots/coral-lagoon-${capture.name}-pearl-near.jpg`,
    type: "jpeg",
    quality: 88,
  });

  await seedPreviousRelease(page);
  await page.getByRole("button", { name: "Worlds", exact: true }).click();
  await page.getByRole("button", { name: "Coral Lagoon", exact: true }).click();
  await page.evaluate(() => window.__fairy.advance(180));
  await page.getByRole("heading", { name: "All 15 friends!" }).waitFor();
  await page.evaluate(() => {
    const g = window.__fairy.game;
    g.setStageCamera(false, true);
    g.renderer.render(g.scene, g.camera);
  });
  await page.waitForTimeout(600);
  await page.screenshot({
    path: `docs/screenshots/coral-finale-${capture.name}.jpg`,
    type: "jpeg",
    quality: 88,
  });
  await page.close();
}

await browser.close();
console.log(JSON.stringify({
  captures: ["coral-meadow-preservation.jpg", ...captures.map((capture) => `coral-lagoon-${capture.name}-pearl-near.jpg`), ...captures.map((capture) => `coral-finale-${capture.name}.jpg`)],
  gameplayStates,
  errors,
}));
if (errors.length) process.exitCode = 1;
