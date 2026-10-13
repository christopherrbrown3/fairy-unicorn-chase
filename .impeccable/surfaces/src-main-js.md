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

**THESIS:** Ride with Mia and Glender and discover one friendly unicorn in each of ten magical worlds through an easy, forgiving chase.

**OWN-WORLD:** Rounded dimensional original figurines and magical pastel landscapes, with recognizable physical scenery and original icons. Level-specific daylight/moonlight, soft shadows, layered eyes, tapered yellow hair, a scalloped blue dress and veined butterfly wings establish the storybook world. Textured paths, planted verges and layered hills deepen the ten settings. No copied racing assets.

**STORY:** Title → chase → friendly catch → Continue, an unlocked world and a revealed collection friend → a ten-friend family finale.

**FIRST VIEWPORT:** The actual meadow scene shows Mia riding yellow-haired, starred Glender. The oversized three-line Baloo title and one giant blue Play action occupy the left; Mia and Glender remain visible on the right. Worlds and Unicorns are quiet secondary destinations; sound is at the top right. No eyebrow is present.

**FORM:** A full-viewport real Three.js world; a character-led title; paper adventure-book menus with ten illustrated world/friend tiles; a sparse top HUD and widely separated steering/water controls; friendly portrait celebrations on a clear flower-ringed island under a physical 3D rainbow, with all ten unicorns in the finale. The concept seed was 2b92a0b2; the pinned rounded pastel storybook direction overrode the roll. No comp or quality card was selected, and no ordered-form selection is claimed.

## Composition and responsive behavior

- Title: copy occupies 45% of the landscape width with a 64px left inset; a light-to-transparent wash makes the text readable while leaving the figures visible. At widths up to 900px the title is 72px. Short landscape uses clamp(43px, 6vw, 68px); portrait uses clamp(55px, 12vw, 90px), 80% copy width and no lower-right note. Below a camera aspect of 0.8, the title camera pulls back and raises its look target so Mia and Glender appear below the menu.
- Books: ten tiles in five columns on landscape, with a 1120px maximum grid width; portrait uses two columns and scrolls above 100px of bottom clearance. World tiles combine a themed landmark and the actual rendered unicorn portrait. Collection silhouettes reveal in full color after a catch.
- Chase: world label left, distance meter center and pause right. Steering anchors to opposite lower corners. Water sits beside right steering. Base steering pads are 124×110px and water is 100×100px; short landscape uses 110×95px and 88×88px, while portrait uses 95×95px and 80×80px. Portrait hides the distance meter and moves controls above the rotation hint. Preserve meaningful icon labels and room for small hands.
- Celebration: copy above and actions below the visible 3D family. The course is hidden so scenery cannot obstruct the island portrait camera. The finale uses two rows of five unicorns with Mia and Glender visible behind the friends. Hearts and sparkles accompany the physical rainbow.

## Evidence and remaining decisions

The finish reviewer returned ship after the eyebrow and hard primary shadow were removed and the finale capture showed Mia, Glender and all ten unicorns clearly. Source-backed evidence is in src/styles/game.css, src/ui/view.js and src/game/scene.js. Reviewed captures are docs/screenshots/title.jpg, meadow.jpg, water.jpg, catch.jpg, worlds.jpg, collection.jpg, finale.jpg and portrait.jpg, plus the ten world captures: meadow, forest, cloud, castle, candy, crystal, garden, night, mountain and palace.

The primary HTTPS game URL was verified live by the build thread. Browser landscape/portrait captures establish rendered appearance; physical iPad performance and real multitouch comfort remain owner checks. World names, unicorn nicknames, Glender's base coat, additional appearance details and tuning remain provisional in DESIGN_NOTES.md. The owner delegated unspecified art and technical choices; this document does not claim child approval of those choices.

## Graphics refinement evidence

The October graphics pass preserves the established storybook direction and all interface tokens. All 19 gallery captures were refreshed and validated. The independent reviewer found character identity, material, typography, world differentiation, controls and celebrations matched the supplied refinement direction; its sole material correction was the stale lighting paragraph in DESIGN.md. That paragraph now records exposure 1.05, the implemented daylight/moonlit lighting and quality-dependent shadow maps. All eight Node tests and ten Chromium/WebKit cases passed. Physical iPad testing remains an owner check.
