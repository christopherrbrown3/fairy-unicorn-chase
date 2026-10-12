// Real rendered gameplay gallery. Test hooks only accelerate the physical chase.
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
await mkdir("docs/screenshots", { recursive: true });
const browser = await chromium.launch({
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
const page = await browser.newPage({
  viewport: { width: 1024, height: 768 },
  hasTouch: true,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(`${process.env.CAPTURE_URL || "http://127.0.0.1:5173"}/?test=1`);
await page.waitForFunction(() => window.__fairy?.screen === "title");
await page.evaluate(() => document.fonts.ready);
const shot = async (name) => {
  await page.screenshot({
    path: `docs/screenshots/${name}.jpg`,
    type: "jpeg",
    quality: 84,
  });
};
await shot("title");
await page.getByRole("button", { name: "Let’s play" }).click();
await page.waitForTimeout(350);
await shot("meadow");
await page.evaluate(() => window.__fairy.advance(3.2));
await page.waitForTimeout(160);
await shot("boost");
await page.getByRole("button", { name: "Spray water" }).tap();
await page.waitForTimeout(420);
await shot("water");
await page.evaluate(() => {
  const g = window.__fairy.game,
    c = g.state,
    o = c.items.find((i) => i.kind === "log" || i.kind === "puddle");
  c.s = o.s - 3;
  c.unicornS = c.s + 45;
  c.lane = o.lane;
  c.step(0.05, c.lane / g.level.width / 0.39);
  g.position(g.player, c.s, c.lane, c.jumpHeight);
  g.updateChaseCamera(1, true);
});
await page.waitForTimeout(350);
await shot("jump");
await page.evaluate(() => {
  window.__fairy.advance(180);
  window.__fairy.game.setStageCamera(false, true);
});
await page.waitForTimeout(500);
await shot("catch");
for (let i = 1; i < 10; i++) {
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.evaluate(() => window.__fairy.advance(12));
  await page.waitForTimeout(180);
  await shot(
    [
      "meadow",
      "forest",
      "cloud",
      "castle",
      "candy",
      "crystal",
      "garden",
      "night",
      "mountain",
      "palace",
    ][i],
  );
  await page.evaluate(() => {
    window.__fairy.advance(180);
    window.__fairy.game.setStageCamera(false, true);
  });
  await page.waitForTimeout(180);
}
await page.waitForTimeout(1800);
await shot("finale");
await page.getByRole("button", { name: "Our unicorns" }).click();
await shot("collection");
await page.getByRole("button", { name: "Back", exact: true }).click();
await page.getByRole("button", { name: "Worlds", exact: true }).click();
await shot("worlds");
await page.setViewportSize({ width: 390, height: 844 });
await page.getByRole("button", { name: "Back", exact: true }).click();
await shot("portrait");
console.log(JSON.stringify({ screenshots: 19, errors }));
await browser.close();
if (errors.length) process.exitCode = 1;
