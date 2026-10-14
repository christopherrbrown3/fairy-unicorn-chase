// Real rendered gameplay gallery. Test hooks only accelerate the physical chase.
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
await mkdir("docs/screenshots", { recursive: true });
const browser = await chromium.launch({
  args:
    process.env.CAPTURE_HARDWARE === "1"
      ? []
      : [
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
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
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
// An in-game detail view documents the actual butterfly model, not concept art.
await page.setViewportSize({ width: 1024, height: 768 });
await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
await page.evaluate(() => {
  window.__fairy.start(6);
  const g = window.__fairy.game;
  g.world.update(1, g.state, g.camera);
  const b = g.world.butterflies[0];
  g.renderer.setAnimationLoop(null);
  g.camera.position.copy(b.position).add({ x: 2.5, y: 2.8, z: 3.3 });
  g.camera.lookAt(b.position);
  g.atmosphere.update(g.camera, 1);
  g.renderer.render(g.scene, g.camera);
});
await shot("butterfly-detail");
console.log(JSON.stringify({ screenshots: 20, errors }));
await browser.close();
if (errors.length) process.exitCode = 1;
