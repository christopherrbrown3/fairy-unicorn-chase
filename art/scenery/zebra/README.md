# Plains zebra scenery source

These are original models authored with Blender 5.2.1, replacing the rejected
primitive-assembled zebra scenery. The protected Mia, Glender and unicorn
assets, rigs, masters and live Blender scene are not inputs or outputs.

- `plains-zebra-masters.blend`: editable connected skin meshes, UVs, materials,
  embedded original coat maps, six static adult/foal pose templates and review
  atelier. The atelier is not exported into the game asset.
- `adult-coat.png`, `foal-coat.png`, `adult-grazing-coat.png`, and
  `foal-grazing-coat.png`: four original 2048 × 2048 UV coat maps baked from
  individually authored surface stripes. Standing coats serve looking and
  walking poses; directly constructed grazing skins have their own UV bakes. No photographic pixels or
  downloaded model assets are used.
- `../../../tools/blender_zebras.py`: anatomical cross-section lofts, connected
  voxel sculpt, smoothing, retopology and pose authoring.
- `../../../tools/blender_zebra_coat.py`: continuous UV islands, original
  tapered and branching Bezier surface stripes, and deterministic UV rasterization. Editable
  centerlines stay in the source file and never export.
- `../../../tools/build-zebras.mjs`: isolated factory-startup build and pinned
  compression; writes only these scenery files and ignored QA output.
- `../../../tools/compress-zebras.mjs`: glTF Transform 4.3.0 encodes Meshopt
  without quantization or lossy filters and lossless WebP. It verifies exact
  decoded attributes, oriented triangles and coat pixels after writing the GLB.
- `../../../public/assets/models/scenery/plains-zebras.glb`: six static templates
  with all four coat images embedded. No external texture URL dependency.

Run from the repository root:

```sh
node tools/build-zebras.mjs
```

Set `BLENDER_BIN` if needed. Normal game builds use the committed asset and do
not require Blender. Rebuilding writes the .blend, coat maps and GLB, and saves
side/front/three-quarter/family/grazing-closeup renders under ignored
`output/qa-zebra/blender/`. It never connects to or changes an open Blender
window. The .blend remains editable; changes made there should also be recorded
in the script if they must survive regeneration.

The forms are informed by actually opened African Wildlife Foundation
[front](https://www.awf.org/sites/default/files/Website_SpeciesPage_Zebra01_Hero.jpg),
[side](https://www.awf.org/sites/default/files/styles/species_image/public/2020-04/Website_SpeciesPage_Zebra02_Challenges.jpg?h=29c6c1f6&itok=ZglObHSp)
and [adult/foal](https://www.awf.org/sites/default/files/styles/horizontal_image/public/2020-04/Website_SpeciesPage_Zebra03_02_Solutions.jpg?h=05d4a2d9&itok=g36LgWwz)
photographs, plus the [San Diego Zoo species account](https://animals.sandiegozoo.org/animals/zebra).
They are an original more natural equid interpretation, not a scanned specimen,
and the repeated templates do not claim unique real-animal markings.

The source PNGs carry `Origin`, `Description`, and the exact
`impeccable:prompt` text key. They truthfully identify original script-authored
surface stripes and Blender baking: no AI bitmap generation or photographic
pixels. The anatomical skin uses broad continuous UV islands with central and
inner-leg seams. Individually varied Bezier stripes are projected to the
surface, then rasterized directly into existing UV islands from surface-to-path
distance with antialiased edges and island padding. A closed muzzle surface
mask covers the nose end as well as the sides; it follows the rigid head pose.
The source blend
keeps editable centerlines and construction cages hidden; only the six final
adult/foal pose roots and their finished meshes are selected for GLB export.

The wrapper executes these export and compression steps (the intermediate is
ignored QA output):

```sh
"/Applications/Blender.app/Contents/MacOS/Blender" --background --factory-startup --threads 2 --python tools/blender_zebras.py
cp public/assets/models/scenery/plains-zebras.glb output/qa-zebra/blender/plains-zebras-uncompressed.glb
npx --yes --package=@gltf-transform/cli@4.3.0 --package=@gltf-transform/core@4.3.0 --package=@gltf-transform/extensions@4.3.0 -- node tools/compress-zebras.mjs output/qa-zebra/blender/plains-zebras-uncompressed.glb public/assets/models/scenery/plains-zebras.glb output/qa-zebra/blender/compression-report.json
```

The integrated pack is 2,626,960 bytes, SHA-256
`38b4317489947bb2c38ff2ea13987a25bfe46178dc4cf5445de44a8b9a2b2fc8`.
Its six templates contain 136,600 triangles: each grazing template has 22,640,
and each looking/walking template 22,830. Four 2K maps estimate 85.33 MiB as
RGBA with mipmaps; WebP reduces transfer bytes, not decoded GPU texture memory.
The 160 placements share six skin geometries across 80 batches in 16 chunks.
The source smoke verifies 3,051,820 logical skin triangles and 5,080,924 logical
world triangles. These totals are not a claim about visible render cost or
physical iPad performance. The accepted face markings retain some local
waviness in close views, and templates repeat markings across the herd.
