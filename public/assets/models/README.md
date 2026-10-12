# Original sparkly potion

`sparkle-potion.glb` is a seven-object, 476-source-vertex Blender asset with sea-glass turquoise body, golden collar, cork, star label and three floating sparkles. No texture downloads are required. It renders in Three.js through GLTFLoader; a complete procedural bottle is retained as a fallback.

Authoring script: `tools/blender_potion.py` in the repository. The script creates a separate scene and exports only that active scene, preserving the user's other Blender work. Update its `asset_dir` for another checkout, create the directory, then run in Blender. The browser animates hovering and rotation.

See `docs/CREDITS.md` for provenance and license notes.
