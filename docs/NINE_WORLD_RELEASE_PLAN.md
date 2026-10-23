# Nine world releases — October 22

The owner requested nine additions, in this order. Every row is a separate
implementation, review, release and live-verification gate. A later world starts
only after the preceding release is published and verified live and the
orchestrator explicitly opens the next gate. Planning a later row is not
implementation or completion.

The baseline is the v1.11.0 sculpted Blender cast. Existing worlds 1–18, their IDs,
collected friends, sound/picture/motion preferences, forgiving controls and the
complete-release PWA/offline/update flow must remain intact. Do not regenerate
or replace the character GLBs, their Blender masters, or runtime rigs as part of
world development. New friends use the shared sculpted unicorn and an appended
mane palette. Preserve unrelated work in other checkouts and the open Blender
scene.

## Ordered tasks and literal acceptance criteria

| Order / world | Required experience | State |
| --- | --- | --- |
| 1 / 19 | **The Thundermans inspired:** recognizable suburban super-family home and secret laboratory, paired warm/cool twin-power motifs, rabbit and gadget displays; no villain combat or new failure state. Provisional world/friend: Thundermans Town / Bolt. | October 23 density revision implemented; focused QA, fresh six-view review and v1.12.0 publication pending. PR #16 open. |
| 2 / 20 | **Fast food:** unmistakable pizza, burgers, fries and milkshakes, with dimensional food scenery and clear pursuit visibility. | Research brief saved; implementation gated. |
| 3 / 21 | **Water park:** recognizable dimensional slides, structural supports and pools; safe path and unchanged controls. | Research brief saved; implementation gated. |
| 4 / 22 | **Zebra savannah:** many visibly striped zebras distributed through the actual playable savannah, rather than a sparse zebra ornament or only a menu illustration. | Research brief saved; implementation gated. |
| 5 / 23 | **Wizard of Oz:** the player actually follows a yellow brick road that **ends at Emerald City**. Repeating green castles around an endless loop does not satisfy this requirement. The endpoint must fit the forgiving pursuit/catch model. | Research brief saved; implementation gated. |
| 6 / 24 | **Princesses:** many visible princess characters as well as princess objects and scenery; an empty palace landscape is insufficient. | Research brief saved; implementation gated. |
| 7 / 25 | **Jungle:** a recognizable overhead canopy, vines and visibly swinging monkeys. Swinging must pause with the game and respect Gentle motion. | Research brief saved; implementation gated. |
| 8 / 26 | **Valentine’s Day:** recognizable Valentine scenery, hearts and affectionate child-friendly motifs. | Research brief saved; implementation gated. |
| 9 / 27 | **Dense forest:** visibly dense woodland with recognizable woodland creatures in the playable scene. | Research brief saved; implementation gated. |

## Research and quality scope

The [source-linked research and density brief](WORLD_THEME_RESEARCH.md) covers
all nine themes. Research for later worlds is planning only. The user's October
23 request for dense, high-quality themed items applies to every row through
release, not only to the current Thundermans revision.

## Required gate for every row

- [ ] Check primary theme references before implementation and save source-linked facts, art decisions and evidence limits.
- [ ] Build abundant varied dimensional scenery in coherent foreground, middle and background groups, while keeping the pursuit visible.
- [ ] Open actual desktop/iPad landscape gameplay captures at opening, middle chase and near catch; freshly review density, detail, repetition, layering and route/character/potion readability.
- [ ] Measure bounded render cost and resource lifetime; a raw prop count alone is not proof of quality or performance.
- [ ] Implement only the current world's scenery/configuration/icon and record its visual contract.
- [ ] Preserve character GLB/runtime hashes and every earlier world's ID and palette.
- [ ] Verify all configured chases, prior-release save migration, preferences, new-friend collection and the full finale.
- [ ] Fit and show all growing **19–27** sculpted friends, including desktop and iPad landscape finale captures; do not assume the former 18-friend camera still fits.
- [ ] Check static model batching, bounded animation if used, reduced motion/pause, resource disposal and console errors.
- [ ] Pass relevant unit/build/browser checks and fresh visual review over opened real captures.
- [ ] Merge/publish the independent release; wait for successful Pages deployment.
- [ ] Verify the public custom domain, a genuine previous-release profile update, preserved saves/preferences, new world, collection/finale and offline launch.
- [ ] Record the release evidence and obtain the orchestrator's explicit next-world gate.

These boxes are a reusable gate specification, not a claim that any release has
completed. Each individual release's actual evidence belongs below and in the
release notes. Browser captures do not establish physical iPad performance.

## World 19 evidence before the density revision

The earlier world19 source passed local unit/build/focused migration/New Game/PWA
checks and received a seven-capture visual SHIP at its original scope. PR #16's
subsequent required CI passed at `2e84335`. Those results predate the stronger
October 23 density request and do not validate the revised scenery. The parent
confirmed the protected v1.11.0 sculpted-character release is now published and
live verified; that release dependency is complete.

## World 19 density revision

Opened prior desktop opening and iPad near-Bolt captures showed broad empty
lawns and repeated house/mailbox forms. Source changes are limited to
`src/worlds/thundermans.js`, theme-scoped placement in `src/worlds/world.js` and
the design/research/implementation plan documents. They add coherent yards,
three house variants, finished side elevations, richer lab interiors,
telekinesis exhibits and a staggered middle-distance garden layer. The original
288 primary slots and eight landmark sets remain bounded; 64 additional garden
groups connect the neighborhood. No later world code has started.

Node geometry smoke confirms all nine exported factories retain every triangle
through material batching and a constructed world disposes its scene root.
The before/after whole-world mesh/triangle metrics below include all scenery
around the entire lap and instanced decoration, but exclude the sculpted cast.
They are geometry inventories, **not frame draw calls or GPU timings**. Actual
six-view render metrics remain required from Luna's capture run.

| Inventory | Before (`2e84335`) | Density revision |
| --- | ---: | ---: |
| Whole-world mesh objects | 615 | 666 |
| Whole-world triangles, including instances | 657,908 | 1,256,176 |
| Roadside spatial chunks | 16 | 16 |

The static triangle inventory increases by 598,268; batching limits the mesh
increase to 51 (8.3%). A current roadside chunk uses 20 material meshes, rather
than rendering each house fixture/flower separately. All nine factories across
three variant inputs preserve triangles and finite vertex coordinates after
baking. This bounded cost is provisional until actual gameplay render metrics
and fresh density/readability review pass.

The existing Mia, Glender, unicorn GLBs and `characters.js` SHA-256 hashes remain
exactly unchanged. Existing controls, scene clock, camera, finale and PWA are
unchanged in this revision. Syntax and static geometry checks pass; focused
browser QA, six fresh gameplay captures, independent review, PR CI, v1.12.0
publication and public/profile/offline verification remain pending.
