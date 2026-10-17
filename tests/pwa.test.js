import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { offlineGame } from "../tools/pwa.mjs";

test("offline build versions change with game code, HTML and public assets", async () => {
  const publicDir = await mkdtemp(join(tmpdir(), "fairy-pwa-"));
  try {
    await writeFile(join(publicDir, "manifest.webmanifest"), '{"name":"Game"}');
    const build = async (code = "old game", html = "old page") => {
      const plugin = offlineGame();
      plugin.configResolved({ publicDir });
      let worker;
      await plugin.generateBundle.call({
        emitFile(file) { worker = file.source; },
        error(message) { throw Error(message); },
      }, {}, {
        "index.html": { type: "asset", source: html },
        "assets/game.js": { type: "chunk", code },
        "assets/game.css": { type: "asset", source: "body{}" },
      });
      return worker;
    };
    const original = await build();
    const version = (worker) => worker.match(/const CACHE = `\$\{PREFIX\}([^`]+)`/)[1];
    assert.equal(version(original), version(await build()), "identical releases stay identical");
    assert.notEqual(version(original), version(await build("new level")));
    assert.notEqual(version(original), version(await build("old game", "new page")));
    await writeFile(join(publicDir, "manifest.webmanifest"), '{"name":"Updated game"}');
    assert.notEqual(version(original), version(await build()));
    assert.match(original, /"assets\/game\.js"/);
    assert.match(original, /"assets\/game\.css"/);
    assert.match(original, /"manifest\.webmanifest"/);
    assert.doesNotMatch(original, /__PRECACHE__|__VERSION__/);
  } finally {
    await rm(publicDir, { recursive: true, force: true });
  }
});
