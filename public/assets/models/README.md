# Original Blender assets

## Character cast

`glender.glb`, `mia.glb`, and `unicorn.glb` are original skinned character models.
Glender has a painted apricot coat, golden hair, enamel stars and riding tack;
Mia has a sculpted face, blonde hair, a blue silk dress and separate translucent
wing membranes. One white unicorn mesh supplies all eighteen mane palettes at
runtime. All three include a Blink face shape.

The models contain their geometry, vertex colors and materials without external
texture URLs. Meshopt compression keeps the combined download below 2 MB; its
decoder is bundled with the game and included in the offline cache. Each asset
contains only its own character and skeleton.

- Authoring source: `tools/blender_characters.py`.
- Editable master: `art/characters/character-masters.blend`.
- Rebuild: `npm run art:characters` (Blender 5.x; tested with 5.2.1).
- Runtime materials, palette variants and animation: `src/characters/characters.js`.
- Local turntable: `/art/characters/preview.html` while the Vite dev server runs.

The rebuild uses a separate factory-startup Blender process, then the pinned
`@gltf-transform/cli@4.3.0` compressor. It overwrites these generated GLBs and the
generated master; preserve hand edits before rebuilding. It does not alter an
already-open Blender document. See `docs/CHARACTER_ART.md` for the full workflow.

## Sparkly potion

`sparkle-potion.glb` is a seven-object, 476-source-vertex Blender asset with sea-glass turquoise body, golden collar, cork, star label and three floating sparkles. No texture downloads are required. It renders in Three.js through GLTFLoader; a complete procedural bottle is retained as a fallback.

Authoring script: `tools/blender_potion.py` in the repository. The script creates a separate scene and exports only that active scene, preserving the user's other Blender work. Update its `asset_dir` for another checkout, create the directory, then run in Blender. The browser animates hovering and rotation.

See `docs/CREDITS.md` for provenance and license notes.
