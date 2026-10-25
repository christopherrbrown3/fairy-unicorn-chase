// Run a fresh Blender process; never touches the user's open scene or cast art.
import { access, copyFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
let blender = process.env.BLENDER_BIN || "blender";
if (!process.env.BLENDER_BIN && process.platform === "darwin") {
  const app = "/Applications/Blender.app/Contents/MacOS/Blender";
  try { await access(app); blender = app; } catch { /* use PATH */ }
}
function run(command, args) {
  const r = spawnSync(command, args, { cwd: root, stdio: "inherit" });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`${command} exited ${r.status}`);
}
run(blender, ["--background", "--factory-startup", "--threads", "2", "--python", "tools/blender_zebras.py"]);
const output = resolve(root, "output/qa-zebra/blender");
await mkdir(output, { recursive: true });
const asset = resolve(root, "public/assets/models/scenery/plains-zebras.glb");
const intermediate = resolve(output, "plains-zebras-uncompressed.glb");
await copyFile(asset, intermediate);
run("npx", ["--yes", "--package=@gltf-transform/cli@4.3.0",
  "--package=@gltf-transform/core@4.3.0", "--package=@gltf-transform/extensions@4.3.0",
  "--", "node", "tools/compress-zebras.mjs", intermediate, asset,
  resolve(output, "compression-report.json")]);
