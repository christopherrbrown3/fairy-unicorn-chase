# Credits and asset provenance

The story, characters and core rules came from a six-year-old creative director, with her dad helping bring the idea to life. Her personal identity is not published.

## Original project assets

- Mia, Glender, the unicorns, manes, terrain, props, rainbows, icons and effects: original geometry authored for Fairy Unicorn Chase. Source lives in `src/characters`, `src/worlds`, `src/art`, `src/game` and `src/ui`.
- Sparkly potion: original Blender mesh made through Blender MCP in a separate scene. Seven objects, 476 source vertices, approximately 28 KB GLB. Regeneration source: `tools/blender_potion.py`. The user's previously open Blender project was restored; no unrelated objects are in the exported asset.
- Music, hoofbeats, water, potion, jump, button and celebration sounds: original Web Audio synthesis in `src/audio/audio.js`, with no external recordings.
- Screenshots: actual browser renders of this game, captured by `tools/capture.mjs`; no stock or generated promotional substitute.

The public repository has not assigned a separate reuse license to original code/art/audio. Third-party components retain their own licenses. Public visibility alone is not a blanket asset reuse license.

## Third-party software and font

| Component | Use | License / source |
| --- | --- | --- |
| Three.js 0.186.1 | 3D runtime and GLTF loader | [MIT](https://github.com/mrdoob/three.js/blob/dev/LICENSE) |
| Vite 8.3.4 | Static build and local development | [MIT](https://github.com/vitejs/vite/blob/main/LICENSE) |
| Playwright 1.64.0 | Browser QA, development only | [Apache 2.0](https://github.com/microsoft/playwright/blob/main/LICENSE) |
| Baloo 2 | Self-hosted Latin variable display font | [SIL Open Font License 1.1](../public/assets/fonts/OFL.txt), [Google Fonts source](https://github.com/google/fonts/tree/main/ofl/baloo2) |

The 33 KB WOFF2 is Fontsource's Latin subset, fetched from `@fontsource-variable/baloo-2@5.3.0/files/baloo-2-latin-wght-normal.woff2`. OFL copyright/license is included beside it. No runtime font CDN request is made.

There are no Nintendo characters, models, music, textures or track designs. Arcade racing inspired the forgiving rhythm and chase camera; all content is original to this game.

### Minecraft Meadow

Minecraft-themed scenery uses custom procedural models created for this game. No Minecraft textures, models, music, or sound files are distributed. Minecraft names and recognizable game concepts belong to their respective owners; this is an unofficial fan-made level.

### Pokémon Park

Pikachu, Bulbasaur, Squirtle, Poké Balls, and Pokémon Center scenery are custom procedural fan models created for this level. No official models, textures, music, or sound files are distributed. Pokémon names and characters belong to their respective owners; this is an unofficial fan-made level.
