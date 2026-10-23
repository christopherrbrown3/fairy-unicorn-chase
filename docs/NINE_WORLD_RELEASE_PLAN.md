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
| 1 / 19 | **The Thundermans inspired:** recognizable suburban super-family home and secret laboratory, paired warm/cool twin-power motifs, rabbit and gadget displays; no villain combat or new failure state. Provisional world/friend: Thundermans Town / Bolt. | Source, local QA and visual review complete; PR #16 open. CI, v1.11.0 publication/profile, and v1.12.0 release remain pending. |
| 2 / 20 | **Fast food:** unmistakable pizza, burgers, fries and milkshakes, with dimensional food scenery and clear pursuit visibility. | Not started. |
| 3 / 21 | **Water park:** recognizable dimensional slides, structural supports and pools; safe path and unchanged controls. | Not started. |
| 4 / 22 | **Zebra savannah:** many visibly striped zebras distributed through the actual playable savannah, rather than a sparse zebra ornament or only a menu illustration. | Not started. |
| 5 / 23 | **Wizard of Oz:** the player actually follows a yellow brick road that **ends at Emerald City**. Repeating green castles around an endless loop does not satisfy this requirement. The endpoint must fit the forgiving pursuit/catch model. | Not started. |
| 6 / 24 | **Princesses:** many visible princess characters as well as princess objects and scenery; an empty palace landscape is insufficient. | Not started. |
| 7 / 25 | **Jungle:** a recognizable overhead canopy, vines and visibly swinging monkeys. Swinging must pause with the game and respect Gentle motion. | Not started. |
| 8 / 26 | **Valentine’s Day:** recognizable Valentine scenery, hearts and affectionate child-friendly motifs. | Not started. |
| 9 / 27 | **Dense forest:** visibly dense woodland with recognizable woodland creatures in the playable scene. | Not started. |

## Required gate for every row

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

## World 19 evidence

Implementation adds only Thundermans scenery/configuration and the >18-friend
finale adaptation; the original layout remains for smaller casts. Unit tests
pass 23/23, the production build passes, focused migration/New Game/PWA checks
pass in Chromium on a verified Apple M2 ANGLE Metal renderer and WebKit, and
the post-merge strict-server root/subpath check passes. Fresh visual review
returned SHIP on all seven opened desktop/iPad-sized captures. The captures
show a real simulated chase at normal physics/events with no target or pickup
repositioning; this is not a physical iPad test.

PR #16 is open; the follow-up required CI run after this status update is
still required. The character source baseline
`27be617` is merged but its v1.11.0 publication/live gate remains pending.
The Mia, Glender, unicorn GLB and `characters.js` SHA-256 values match that
baseline exactly. Merge, v1.12.0 tag, Pages deployment, a seeded isolated
v1.11.0 client update, and public/offline checks remain pending.
