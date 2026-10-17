// Capture Candy Carnival at desktop and iPad landscape sizes, including the
// fourteen-friend finale reached by completing the last world.
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const base = process.env.CAPTURE_URL || "http://127.0.0.1:5173";
await mkdir("docs/screenshots", { recursive: true });
const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const errors = [];
const captures = process.env.FINALE_ONLY === "1"
  ? [{ name: "ipad", viewport: { width: 1180, height: 820 } }]
  : [
      { name: "desktop", viewport: { width: 1440, height: 900 } },
      { name: "ipad", viewport: { width: 1180, height: 820 } },
    ];

for (const capture of captures) {
  const page = await browser.newPage({ viewport: capture.viewport, hasTouch: true });
  page.on("pageerror", (e) => errors.push(`${capture.name}: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`${capture.name}: ${m.text()}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${capture.name}: ${r.status()} ${r.url()}`);
  });
  await page.goto(`${base}/?test=1`);
  await page.waitForFunction(() => window.__fairy?.screen === "title");
  if (process.env.FINALE_ONLY !== "1") {
    await page.evaluate(() => window.__fairy.start(13));
    await page.evaluate(() => window.__fairy.advance(12));
    await page.waitForTimeout(300);
    await page.screenshot({ path: `docs/screenshots/candy-carnival-${capture.name}.jpg`, type: "jpeg", quality: 88 });
  }

  // Carry all earlier friends forward, then finish Candy Carnival to capture
  // the real final celebration with all fourteen unicorns present.
  await page.evaluate(() => {
    localStorage.setItem("fairy-unicorn-chase:v1", JSON.stringify({
      version: 1,
      completed: Array.from({ length: 13 }, (_, id) => id),
      sound: false,
      quality: "low",
      reducedMotion: true,
    }));
  });
  await page.reload();
  await page.waitForFunction(() => window.__fairy?.screen === "title");
  await page.getByRole("button", { name: "Worlds", exact: true }).click();
  await page.getByRole("button", { name: "Candy Carnival", exact: true }).click();
  await page.evaluate(() => window.__fairy.advance(180));
  await page.getByRole("button", { name: "Our unicorns" }).waitFor();
  await page.evaluate(() => {
    const g = window.__fairy.game;
    g.setStageCamera(false, true);
    g.renderer.render(g.scene, g.camera);
  });
  await page.waitForTimeout(500);
  const finalePath = process.env.FINALE_ONLY === "1"
    ? "docs/screenshots/candy-finale-ipad-settled.jpg"
    : `docs/screenshots/candy-finale-${capture.name}.jpg`;
  await page.screenshot({ path: finalePath, type: "jpeg", quality: 88 });
  await page.close();
}

await browser.close();
console.log(JSON.stringify({ captures: captures.map((c) => c.name), errors }));
if (errors.length) process.exitCode = 1;
