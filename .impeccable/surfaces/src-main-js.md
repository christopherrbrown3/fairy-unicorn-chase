---
version: 1
slug: "src-main-js"
primary_target: "src/main.js"
related_targets: ["src/styles/game.css","src/ui/view.js","src/game/scene.js"]
---

# Game surface brief

Mode: Experience.

Scope: the title, playable chase, world book, collection book, pause sheet and celebration states of the static game. A six-year-old on an iPad in landscape is the primary player; family can also use desktop controls. The job is to join Mia and Glender, chase a friendly unicorn and discover the next world. PRODUCT.md owns product truth; DESIGN_NOTES.md owns child confirmations and provisional decisions.

## Built direction contract

**THESIS:** Ride with Mia and Glender and discover one friendly unicorn in each of thirteen magical worlds through an easy, forgiving chase.

**OWN-WORLD:** Rounded dimensional original figurines and magical pastel landscapes, with recognizable physical scenery and original icons. Level-specific daylight/moonlight, soft shadows, layered eyes, tapered yellow hair, a scalloped blue dress and veined butterfly wings establish the storybook world. Textured paths, planted verges and layered hills deepen the thirteen settings. No copied racing assets.

**STORY:** Title → chase → friendly catch → Continue, an unlocked world and a revealed collection friend → a thirteen-friend family finale.

**FIRST VIEWPORT:** The actual meadow scene shows Mia riding yellow-haired, starred Glender. The oversized three-line Baloo title and one giant blue Play action occupy the left; Mia and Glender remain visible on the right. Worlds and Unicorns are quiet secondary destinations; New game and sound share the top right. No eyebrow is present.

**FORM:** A full-viewport real Three.js world; a character-led title; paper adventure-book menus with thirteen illustrated world/friend tiles; a sparse top HUD and widely separated steering/water controls; friendly portrait celebrations on a clear flower-ringed island under a physical 3D rainbow, with all thirteen unicorns in the finale. The concept seed was 2b92a0b2; the pinned rounded pastel storybook direction overrode the roll. No comp or quality card was selected, and no ordered-form selection is claimed.

## Composition and responsive behavior

- Title: copy occupies 45% of the landscape width with a 64px left inset; a light-to-transparent wash makes the text readable while leaving the figures visible. At widths up to 900px the title is 72px. Short landscape uses clamp(43px, 6vw, 68px), anchors the copy 20px from the top with safe-area clearance and a 42px left inset, and tightens subtitle spacing. Play stays at least 64px tall and book links 48px; saved progress aligns below the navigation near the bottom edge. Portrait uses clamp(55px, 12vw, 90px), 80% copy width and no lower-right note. Below a camera aspect of 0.8, the title camera pulls back and raises its look target so Mia and Glender appear below the menu.
- Books: thirteen tiles in five columns on landscape, with a 1120px maximum grid width; portrait uses two columns and scrolls above 100px of bottom clearance. World tiles combine a themed landmark and the actual rendered unicorn portrait. Collection silhouettes reveal in full color after a catch.
- Chase: world label left, distance meter center and pause right. Steering anchors to opposite lower corners. Water sits beside right steering. Base steering pads are 124×110px and water is 100×100px; short landscape uses 110×95px and 88×88px, while portrait uses 95×95px and 80×80px. Portrait hides the distance meter and moves controls above the rotation hint. Preserve meaningful icon labels and room for small hands.
- Celebration: copy above and actions below the visible 3D family. The course is hidden so scenery cannot obstruct the island portrait camera. The finale dynamically splits the unicorns into two independently centered rows, currently seven and six, with Mia and Glender visible behind the friends. Hearts and sparkles accompany the physical rainbow.
- Pause and reset: Home / New game share a row. Short landscape also pairs Resume / Restart in a wider 680px-maximum sheet; overflow remains scrollable from the top. Portrait leaves clearance for the orientation hint. The native New game dialog uses the existing warm-paper/blue palette, a 560px maximum width and bounded scrolling. Cancel receives initial focus, Escape cancels, and cancellation returns focus to the opener in the unchanged menu. Landscape confirmation buttons share a row; portrait stacks them.

## Evidence and remaining decisions

The finish reviewer returned ship after the eyebrow and hard primary shadow were removed and the finale capture showed Mia, Glender and all ten unicorns clearly. Source-backed evidence is in src/styles/game.css, src/ui/view.js and src/game/scene.js. Reviewed captures are docs/screenshots/title.jpg, meadow.jpg, water.jpg, catch.jpg, worlds.jpg, collection.jpg, finale.jpg and portrait.jpg, plus the ten world captures: meadow, forest, cloud, castle, candy, crystal, garden, night, mountain and palace.

The primary HTTPS game URL was verified live by the build thread. Browser landscape/portrait captures establish rendered appearance; physical iPad performance and real multitouch comfort remain owner checks. World names, unicorn nicknames, Glender's base coat, additional appearance details and tuning remain provisional in DESIGN_NOTES.md. The owner delegated unspecified art and technical choices; this document does not claim child approval of those choices.

## Graphics refinement evidence

The first October graphics pass preserved the established storybook direction and interface tokens. Its 19 gallery captures were refreshed and validated. The independent reviewer found character identity, material, typography, world differentiation, controls and celebrations matched that refinement direction; its sole material correction was the stale lighting paragraph in DESIGN.md. That paragraph was updated to record exposure 1.05, the implemented daylight/moonlit lighting and quality-dependent shadow maps. All eight Node tests and ten Chromium/WebKit cases passed for that earlier pass.

The subsequent living-scenery and butterfly pass is evidenced by source through `74c3e7f` and 20 refreshed gallery captures, including `docs/screenshots/butterfly-detail.jpg`, plus the desktop/mobile finish-review captures. It adds rippling lily ponds, drifting billowed clouds, a Starlight Valley aurora, wind-bent grass, cupped flowers, character blinks and bending knees, richer hair/dress details, a six-color boost ribbon and fading sparkle particles. Butterfly art now has four palettes, scalloped lobes, veins, borders, cream edge spots and paired eyespots; two garden butterflies accompany the rider. Mia retains blue/lilac wings with a physical iridescent material.

The full review requested two fixes: intersecting butterfly wing layers and dark shading on Mia's mirrored wing. Butterfly panels now remain flat and parallel through hinged flutter; Mia's finished wing group is mirrored to preserve the intended lighting. The final review marked both fixes resolved and returned ship at that fix-list scope. This is not a new full-surface review. All 20 gallery captures and both finish-review captures are valid. Eight Node tests, the production build and all ten Chromium/WebKit browser regression cases passed. Physical iPad performance and real multitouch comfort remain owner checks.

## Spooky House v1.1.0

Spooky House adds the eleventh world and Boo, a white unicorn with a pale-green mane. Friendly ghosts, smiling pumpkins and moonlit houses extend the established storybook artwork. A broad, lit hallway lets the chase pass through the house scenery while its walls stay off the road. The finale now accommodates all eleven friends in two independently centered rows of six and five.

Implementation evidence is in `src/config/levels.js`, `src/worlds/spooky.js`, `src/worlds/world.js` and `src/game/scene.js`. Current review captures are `.impeccable/review/spooky/tablet.png`, `phone.png`, `finale.png` and `collection-phone.png`. The earlier review records above describe their original ten-world builds.

## Minecraft Meadow v1.2.0

World 12 adds Pixel, an emerald-maned white unicorn. Custom procedural cube oaks, layered grass-and-dirt blocks, diamond ore, pigs, friendly creepers, torches, and broad mine gateways establish the Minecraft theme. Stepped hills and rectangular clouds replace rounded scenery in this world; the original fairy and pony artwork and controls remain. The current finale has twelve friends in two centered rows of six. Evidence: `src/worlds/minecraft.js`, `src/worlds/world.js`, and `.impeccable/review/minecraft/{tablet,phone,finale,collection-phone}.png`.

## Pokémon Park v1.3.0

World 13 adds Spark, a cobalt-maned white unicorn, in a pastel park with custom procedural Pikachu, Bulbasaur, Squirtle, Poké Balls, broad garden gateways, and Pokémon Centers. The fairy and pony, controls, and gentle chase stay consistent. The current finale contains thirteen friends in centered rows of seven and six. Source: `src/worlds/pokemon.js` and `src/worlds/world.js`; review captures: `.impeccable/review/pokemon/{tablet,phone,finale,collection-phone}.png`. Earlier release records describe their own shipped counts.

## New game v1.4.0

The title and pause menus now offer New game with an explicit reset confirmation. Confirming clears only collection progress, relocks later worlds and begins Rainbow Meadow; saved preferences remain. Native dialog focus management and menu-aware keyboard handling protect cancellation and keyboard activation. Source: `src/ui/view.js`, `src/main.js`, `src/game/save.js`, `src/game/input.js` and `src/styles/game.css`. Release validation is recorded separately after testing; this entry describes the implementation.
