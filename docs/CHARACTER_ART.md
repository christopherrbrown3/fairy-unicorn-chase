# Character art

The v1.11.0 character upgrade covers Mia, Glender and all eighteen unicorn
variants. It preserves the original identities and the existing game worlds,
controls, saves and forgiving chase rules. It is a step toward richer stylized
character art; AAA production quality and physical iPad performance are not
claimed. [Release history](RELEASES.md).

## Inspect the models

Run `npm run dev`, then open
`http://127.0.0.1:5173/art/characters/preview.html` (use the port Vite prints if it
differs). Drag to rotate, scroll or pinch to zoom, select Mia and Glender or a
unicorn, and toggle Gallop or Jump. The studio uses the same GLBs, materials and
animation code as the game. It is a development tool and is not included in the
production build.

![The upgraded cast in the character studio](screenshots/character-cast.png)

[Mia close-up](screenshots/character-mia.png) ·
[Actual chase view](screenshots/character-chase.png)

These are Playwright captures of the running local game and studio, rather than
promotional artwork. The cast capture is 1440 × 1000; the chase is 1024 × 768.
The review also checks the title and studio at 390 × 844. Viewport checks do not
replace a playtest on an iPad.

## Editable source and rebuilding

- `art/characters/character-masters.blend` contains the three original rigs,
  editable meshes, vertex colors, materials, face shapes, camera and lights.
- `tools/blender_characters.py` is the procedural authoring source.
- `tools/build-characters.mjs` runs Blender separately and compresses the exports.
- `public/assets/models/{glender,mia,unicorn}.glb` are the shipped assets.
- `src/characters/characters.js` supplies the browser materials, palettes,
  skeleton cloning, blinking and procedural motion.

To regenerate:

```bash
npm run art:characters
npm test
npm run build
```

The art build requires Blender 5.x and was tested with Blender 5.2.1. On macOS it
finds `/Applications/Blender.app`; elsewhere it uses `blender` on PATH. Set
`BLENDER_BIN` to override the executable. The build runs with factory startup in
a separate process, so an open Blender project is preserved.

Regeneration overwrites the master and three generated GLBs. Put durable changes
in the Python authoring source, or save manual Blender edits separately before
running it. Uncompressed intermediate files and the generated Python runner go
under ignored `output/characters/`. Compression uses the pinned
`@gltf-transform/cli@4.3.0` via npx; its first use needs network access. Normal
game builds use the committed GLBs and do not require Blender or that CLI.

## Runtime design

Glender has continuous sculpted anatomy, a softly painted coat, an ivory muzzle
blaze, gold and ivory stars, leather reins and a blue saddle blanket. Mia has a
sculpted face, layered eyes and lashes, swept blonde locks, a floral crown,
double-layered blue dress, riding boots and four translucent wing lobes. The
unicorn shares a white coat, pearl details, lavender hooves and a spiral gold
horn; its five mane-material bands produce each configured color or the rainbow.

The loader shares mesh geometry and gives each instance its own skeleton,
expression state and materials. Limb motion uses the imported bone bases, so
mesh compression and glTF coordinate conversion do not detach body parts.
Glender and Mia share the same body suspension. Separate wing membranes sort
independently; their surface has interior rings to keep curved faces smooth.

Coats and skin use soft sheen; hair and silk use tiny deterministic normal maps;
eyes and metal details receive a small shared environment map. Wings use the
world's lights and iridescence without reflecting the studio environment.
Gentle motion suppresses secondary hair, tail and wing animation. Pausing still
freezes the scene through the game's existing clock.

World replacement releases instance materials and skeleton textures while
retaining reusable geometry and tiny surface maps. Portrait rendering uses the
same character assets and disposes its own environment target afterward.

## Asset and performance boundaries

All three compressed GLBs together remain below 2 MB. The character unit test
guards that download budget, isolated scenes, skeleton joints, painted colors,
blink shapes and material counts. The decoder is bundled locally with Three.js;
models and code join the existing complete-build offline cache.

| Asset | Triangles | Compressed bytes |
| --- | ---: | ---: |
| Glender | 65,480 | 549,384 |
| Unicorn | 63,958 | 533,812 |
| Mia | 92,394 | 717,484 |
| Total download | | 1,800,680 |

The models add geometry and more complex surface shading. Shared meshes and
merged material groups bound their draw calls, but these changes do not establish
a device frame-rate target. The eighteen-unicorn finale and sustained iPad play
still require physical-device testing. Existing Automatic and Gentle picture
quality settings remain available.

## Verification

The new browser rig check samples multiple gallop and blink poses, verifies
finite deformed bounds, switches to the rainbow unicorn and checks that old
skeleton resources were released. Existing browser cases cover root/subpath
hosting, controls, jumps, all eighteen chases, progress, menus and offline play.
Final run results are recorded in `IMPLEMENTATION_PLAN.md`.

October 22 verification: 22 unit tests passed; the production build passed;
31 browser cases passed across Chromium/Metal and WebKit. Three duplicate WebKit
viewport screenshot cases are intentionally skipped by the existing test suite.
The run includes cold offline launches at both hosting paths and failed-update
recovery. The normal software-renderer CI configuration remains unchanged.
