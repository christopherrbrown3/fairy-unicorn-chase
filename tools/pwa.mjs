import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

// Derive the offline shell from the actual build, including hashed JS/CSS and
// self-hosted models/fonts. A changed file creates a new worker/cache version.
export function offlineGame() {
  let publicDir;
  return {
    name: "offline-game",
    apply: "build",
    enforce: "post",
    configResolved(config) {
      publicDir = config.publicDir;
    },
    async generateBundle(_, bundle) {
      const files = new Map();
      for (const [name, output] of Object.entries(bundle)) {
        if (/\.(html|js|css|woff2|glb)$/.test(name))
          files.set(name, output.type === "chunk" ? output.code : output.source);
      }
      for (const entry of await readdir(publicDir, { recursive: true, withFileTypes: true })) {
        if (!entry.isFile() || !/\.(woff2|glb|png|svg|webmanifest)$/.test(entry.name)) continue;
        const path = resolve(entry.parentPath, entry.name);
        const name = path.slice(publicDir.length + 1).replaceAll("\\", "/");
        files.set(name, await readFile(path));
      }
      if (!files.has("index.html")) this.error("The offline game needs index.html");
      const hash = createHash("sha256");
      const names = [...files.keys()].sort();
      for (const name of names) hash.update(name).update(files.get(name));
      const worker = await readFile(new URL("../src/pwa/service-worker.js", import.meta.url), "utf8");
      hash.update(worker);
      this.emitFile({
        type: "asset",
        fileName: "sw.js",
        source: worker
          .replace("__PRECACHE__", JSON.stringify(names))
          .replace("__VERSION__", hash.digest("hex").slice(0, 16)),
      });
    },
  };
}
