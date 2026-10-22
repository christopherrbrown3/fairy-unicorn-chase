// Rebuild original art in a separate Blender process; never changes an open file.
import { readFile, writeFile, mkdir, copyFile, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "output/characters");
await mkdir(output, { recursive: true });
await mkdir(resolve(root, "art/characters"), { recursive: true });
let blender = process.env.BLENDER_BIN || "blender";
if (!process.env.BLENDER_BIN && process.platform === "darwin") {
  const app = "/Applications/Blender.app/Contents/MacOS/Blender";
  try {
    await access(app);
    blender = app;
  } catch {
    /* Use PATH. */
  }
}
let source = await readFile(
  resolve(root, "tools/blender_characters.py"),
  "utf8",
);
source = source.replace(
  /^PROJECT_DIR = .*$/m,
  `PROJECT_DIR = ${JSON.stringify(root)}`,
);
source += `
# This suffix runs only in a fresh factory-startup Blender process.
bpy.context.window.scene=scene
for obj in list(previous_scene.objects):
    bpy.data.objects.remove(obj,do_unlink=True)
bpy.data.scenes.remove(previous_scene)
camera_data=bpy.data.cameras.new('Character master camera')
camera=bpy.data.objects.new('Character master camera',camera_data)
scene.collection.objects.link(camera)
camera.location=(7,-11,5)
camera.rotation_euler=(Vector((0,0,1.7))-camera.location).to_track_quat('-Z','Y').to_euler()
camera_data.lens=50
scene.camera=camera
for name,location,power,size in [('Key',(-4,-5,7),950,5),('Fill',(5,-2,4),650,4),('Rim',(0,4,6),1100,3)]:
    data=bpy.data.lights.new(name,'AREA')
    data.energy=power
    data.shape='DISK'
    data.size=size
    light=bpy.data.objects.new(name,data)
    scene.collection.objects.link(light)
    light.location=location
    light.rotation_euler=(Vector((0,0,1.7))-light.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.wm.save_as_mainfile(filepath=PROJECT_DIR+'/art/characters/character-masters.blend',compress=True)
`;
const script = resolve(output, "build.py");
await writeFile(script, source);
function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`${command} exited ${result.status}`);
}
run(blender, [
  "--background",
  "--factory-startup",
  "--threads",
  "2",
  "--python",
  script,
]);
for (const name of ["glender", "unicorn", "mia"]) {
  const target = resolve(root, `public/assets/models/${name}.glb`);
  const original = resolve(output, `${name}.glb`);
  await copyFile(target, original);
  run("npx", [
    "--yes",
    "@gltf-transform/cli@4.3.0",
    "meshopt",
    original,
    target,
    "--level",
    "high",
  ]);
}
