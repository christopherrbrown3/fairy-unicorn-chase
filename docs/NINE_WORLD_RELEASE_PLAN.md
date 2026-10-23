# Nine world releases — October 22

The owner requested nine additions, in this order. Every row is a separate
implementation, review, release and live-verification gate. A later world starts
only after the preceding release is published and verified live and the
orchestrator explicitly opens the next gate. Planning a later row is not
implementation or completion.

**Current stop instruction (October 23):** finish and release Fast Food Land,
then STOP. Water Park and all later worlds must remain unimplemented until a
new explicit instruction from the human owner. Completing world 20 does not
automatically authorize the next row.

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
| 1 / 19 | **The Thundermans inspired:** recognizable suburban super-family home and secret laboratory, paired warm/cool twin-power motifs, rabbit and gadget displays; no villain combat or new failure state. Provisional world/friend: Thundermans Town / Bolt. | COMPLETE — v1.12.0 published and live/profile/offline verified at 55e3ae6; PR #16 merged. |
| 2 / 20 | **Fast food:** unmistakable pizza, burgers, fries and milkshakes, with dimensional food scenery and clear pursuit visibility. Fast Food Land / Sesame. | ACTIVE — source implemented; unit/build/geometry smoke pass; focused QA, six-view review and v1.13.0 publication pending. Stop after this release. |
| 3 / 21 | **Water park:** recognizable dimensional slides, structural supports and pools; safe path and unchanged controls. | Research brief saved; implementation paused by owner until a new human instruction. |
| 4 / 22 | **Zebra savannah:** many visibly striped zebras distributed through the actual playable savannah, rather than a sparse zebra ornament or only a menu illustration. | Research brief saved; implementation paused by owner until a new human instruction. |
| 5 / 23 | **Wizard of Oz:** the player actually follows a yellow brick road that **ends at Emerald City**. Repeating green castles around an endless loop does not satisfy this requirement. The endpoint must fit the forgiving pursuit/catch model. | Research brief saved; implementation paused by owner until a new human instruction. |
| 6 / 24 | **Princesses:** many visible princess characters as well as princess objects and scenery; an empty palace landscape is insufficient. | Research brief saved; implementation paused by owner until a new human instruction. |
| 7 / 25 | **Jungle:** a recognizable overhead canopy, vines and visibly swinging monkeys. Swinging must pause with the game and respect Gentle motion. | Research brief saved; implementation paused by owner until a new human instruction. |
| 8 / 26 | **Valentine’s Day:** recognizable Valentine scenery, hearts and affectionate child-friendly motifs. | Research brief saved; implementation paused by owner until a new human instruction. |
| 9 / 27 | **Dense forest:** visibly dense woodland with recognizable woodland creatures in the playable scene. | Research brief saved; implementation paused by owner until a new human instruction. |

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
groups connect the neighborhood. At this revision, no later world code had started.

Node geometry smoke confirms all nine exported factories retain every triangle
through material batching and a constructed world disposes its scene root.
The before/after whole-world mesh/triangle metrics below include all scenery
around the entire lap and instanced decoration, but exclude the sculpted cast.
They are geometry inventories, **not frame draw calls or GPU timings**. Actual
visible-frame render metrics are recorded below.

| Inventory | Before (`2e84335`) | Density revision |
| --- | ---: | ---: |
| Whole-world mesh objects | 615 | 666 |
| Whole-world triangles, including instances | 657,908 | 1,256,176 |
| Roadside spatial chunks | 16 | 16 |

The static triangle inventory increases by 598,268; batching limits the mesh
increase to 51 (8.3%). A current roadside chunk uses 20 material meshes, rather
than rendering each house fixture/flower separately. All nine factories across
three variant inputs preserve triangles and finite vertex coordinates after
baking. These geometry counts are separate from visible-frame render cost.

The existing Mia, Glender, unicorn GLBs and `characters.js` SHA-256 hashes remain
exactly unchanged. Existing controls, scene clock, camera, finale and PWA are
unchanged in this revision. The refreshed hashes match the live v1.11.0 models:
Glender `e91d5748df02f43ac65a03650ce3d64c788f95bccb8847054368399c835f5e76`,
Mia `f92cb748aafac35b1bb4d4f7ba86100923366cc0072a08455e27aace8762cfb5`,
unicorn `d0317095b9abf274a53b4f60615b61c89c22d03ceccef6765ee87838f68bcfda`,
and `characters.js` `60b26449166c609f0ef618153e24f83d028416b13a113619d788fc9e0911a495`.

October 23 local QA after the density revision: unit tests 23/23 and production
build pass. Focused Chromium and WebKit checks pass for rendered potion/jump/
collision behavior and the previous-release save path through unlocked newest
world, actual catch, 19-friend finale, saved preferences and reload. Six fresh
desktop/iPad landscape gameplay captures cover the opening, middle and near-Bolt
route; their approved copies appear in `docs/screenshots`. The opening shows an
uncollected potion ahead; near captures show Bolt about 14 units ahead before
catch. They were rendered at Automatic quality on verified ANGLE Metal / Apple
M2, with no console, page or failed-resource errors. A bounded 210-frame render
sample measured 266–298 calls and approximately 0.87–0.96 million visible
triangles in representative Automatic views, with 3.2–3.4 ms median and
4.0–4.1 ms p95 frame submission. Low quality measured 220–232 calls and about
0.65 million visible triangles, with 3.1–3.2 ms median and 3.7 ms p95 across
150 frames. These are desktop Apple M2 measurements, not physical iPad
performance. Independent density/readability review returned SHIP. Publication
and public/profile/offline gates subsequently completed as recorded below.


## World 19 publication gate — COMPLETE

[PR #16](https://github.com/christopherrbrown3/fairy-unicorn-chase/pull/16) merged;
[v1.12.0](https://github.com/christopherrbrown3/fairy-unicorn-chase/releases/tag/v1.12.0)
points to `55e3ae646222f3a5b26c8db69496e488dbb66b35`. The
[main workflow / Pages run](https://github.com/christopherrbrown3/fairy-unicorn-chase/actions/runs/39958486106)
succeeded. Root reviewed the production reports and matched the served bundle
SHA with the local release. A genuine cached v1.11.0 profile explicitly used
Update game, preserving all original 18 completed IDs, sound/quality/Gentle-motion
preferences and unrelated storage. The updated client caught Bolt online and
offline, showing the 19-friend finale/collection. Evidence is saved locally in
`output/qa-thundermans/live-v112-update-report.json`,
`live-v112-gameplay-report.json` and `live-v112-offline-report.json`. These are
browser checks, not a physical-device claim. Root explicitly opened world20
only after this gate was complete.

## World 20 source handoff — ACTIVE

Fast Food Land / Sesame appends internal ID19 and mane `#b96d80`. Production
changes are limited to new `src/worlds/fastfood.js`, the appended level/palette
and burger icon, theme-only placement and grass/pond exclusions. Existing cast,
other worlds, controls, camera/finale, saves and PWA code remain unchanged.
Primary source images were actually opened and observation-to-art decisions
are recorded in the [research brief](WORLD_THEME_RESEARCH.md#world-20-visual-inspection-and-implementation--october-23).

The 288 main scenes include 64 meal trays, 64 pizza boards and 32 each of fry
cartons, shake counters, booths, burgers and kiosks. A separate layer adds 16
burger diners, 16 larger pizza kiosks, 32 terrace booths and 32 tall shakes;
256 small herb/tomato planters and alternating tile trim connect the verges.
All four food families occur throughout every spatial chunk. Everything is
static and belongs to bounded material batches; houses from other worlds and
character art are not reused as substitute food shapes.

The full-lap scenery inventory is 454 mesh objects / 2,839,160 triangles
(including instances, excluding cast), with 16 spatial chunks and 11 material
meshes in a representative roadside chunk. Unlike the old global landmark
pattern, large restaurants are chunked with their neighborhoods. This inventory
is not a GPU/frame timing claim. Fresh actual opening/middle/near-catch captures
on desktop/iPad landscape must confirm quality, visibility and render cost.

Unit tests pass 23/23 and the production build passes at the unchanged v1.12.0
package version; Luna owns the next release version. Factory geometry/batching
smoke passes, and constructed world disposal removes its scene root. Focused
QA, 20-friend finale/collection, genuine previous-release update/offline tests,
independent visual review, CI and v1.13.0 publication remain pending. After that
release, stop as requested; do not implement world21 automatically.
