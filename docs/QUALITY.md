# Quality and device checks

## Automated coverage

Twenty-seven Node tests cover real pursuit in every world, proximity-only captures after an unaligned overtake, curve closure, steering and recentering, screen-relative lane direction on multiple bends in all twenty-two courses, potion speed and expiry, automatic jumps, gentle collisions, cosmetic water, save validation, release-to-release save migration, batched art geometry preservation for fan and new-world scenery, Blender zebra template/coat validation and scenery batching/disposal, bounded reduced-time reef life and snowfall, underwater-atmosphere reset, unavailable storage, and offline build version changes when game code, HTML or public assets change.

Browser scenarios run in Chromium and WebKit at 1024 × 768 with touch support. They cover:

- Custom-domain root and repository subpath, entry point, no failed asset requests, runtime errors or shader console errors, and actual Mia/Glender/unicorn meshes and Blender potion.
- Arrow/A/D input with projected on-screen movement matching the arrow direction, held pointer steering, touch water, Chromium two-finger steering plus water, pause/resume and saved sound/picture/motion preferences.
- Potion pickup with actual increased movement speed, automatic jump triggers and gentle obstacle contact.
- Locked worlds, all twenty-two genuine distance-based catches, Continue, collection unlocks, twenty-two-unicorn finale, reload persistence and unlocked replay.
- Migration from the previous twenty-one-world save into Zebra Savannah, completing Aster, the twenty-two-friend collection/finale, preserved preferences and progress, plus New Game reset behavior.
- Corrupt storage recovery, portrait hint and touch targets at least 80 CSS px.
- Static link-preview metadata, manifest scope and icon dimensions at both hosting paths; a cold offline launch loads the font, authored potion model, saved progress and a playable unlocked world.
- Installation help and a simulated browser install prompt; actual Home Screen installation remains a device check.
- A served old/new release transition downloads a complete update, waits through active play, updates only from a menu, preserves progress/preferences and unrelated caches, and leaves a second open chase running. Updating that older copy must retain progress collected in the newer copy. An incomplete release is rejected and the last working version still launches offline. These lifecycle fixtures pause continuous rendering between checks to keep two software WebGL scenes from competing; gameplay behavior has separate rendered regression tests.

The opt-in `?test=1` API advances the same physical simulation faster. It does not set a catch flag, invent wins or appear as a player-facing menu. These checks verify systems; they do not substitute for a child's playtest.

## Screenshot review

The real rendered game was captured at 1024 × 768. `docs/screenshots/` includes the title, ten worlds, boost, water spray, automatic jump, friendly catch, world menu, collection and final group celebration, plus the 390 × 844 portrait hint. A detail capture, `butterfly-detail.jpg`, uses a deliberately close camera to show the actual in-game butterfly model; it is not the ordinary chase view. Release captures add desktop and iPad-landscape gameplay and finale views for later worlds; Coral Lagoon's Pearl-near, Christmas Village's Holly-near, Pancake Picnic's Maple-near, Big City Downtown's Metro-near, Thundermans Town's Bolt-near, Fast Food Land's Sesame-near, Splash Water Park's Dipper-near and Zebra Savannah's Aster-near views show each friend at a measured natural chase distance. Rainbow Meadow captures check that established scenery returns. Later-world packets include normal-opening blue potion captures. These are browser viewports, not physical iPad captures; the gallery is refreshed after visual changes and image sizes remain modest.

Splash Water Park adds static flumes, pools and deck scenery in 16 spatial chunks. On the verified Apple M2/Metal renderer, visible chase geometry measured about 904,000 triangles / 226 calls at Automatic and 486,000 / 146 at Low; bounded 180-frame JavaScript CPU render-submission samples were 1.1 ms median / 2.0 ms p95 and 0.6 / 2.5 ms. Its 21-friend finale measured 3.00 million triangles / 844 calls at Automatic and 1.51 million / 427 at Low; CPU submission was 4.5 / 5.1 ms at Automatic. These are desktop renderer observations at desktop and iPad-sized browser viewports, not GPU timings or physical iPad performance claims. The approved Water Park gallery captures opening/middle/near-catch route views and complete finales at both sizes.

Zebra Savannah uses a compressed Blender GLB with 160 hornless adult/foal zebras across three poses, six shared skin templates, and four original 2048 × 2048 coat maps. Its 5,080,924-triangle full-lap logical geometry inventory includes repeated instances; it is not a visible-frame measurement. On Chromium with the verified Apple M2/Metal backend, the natural near-Aster view submitted 1,895,216 visible triangles / 262 calls at Automatic and 1,138,102 / 175 calls at Low. Bounded 180-frame JavaScript CPU render-submission samples measured 1.5 ms median / 3.3 ms p95 at Automatic and 1.0 / 2.9 ms at Low. After normal final-camera easing settled below 0.01 units, the 22-friend finale submitted 3,190,070 triangles / 1,271 calls at Automatic and 1,628,640 / 836 at Low. Settled-finale CPU submission measured 5.9 / 7.3 ms median/p95 at Automatic and 4.1 / 5.4 ms at Low (35 warm-up plus 180 measured frames). These are CPU submission observations, not GPU timings or sustained FPS. Desktop-renderer measurements and iPad-sized Chromium viewports do not establish physical iPad performance. The reviewed image set covers [opening](screenshots/zebra-opening-desktop.jpg), [midpoint](screenshots/zebra-middle-desktop.jpg), [natural near-catch](screenshots/zebra-near-aster-desktop.jpg) and [full finale](screenshots/zebra-finale-desktop.jpg), with corresponding [iPad-sized opening](screenshots/zebra-opening-ipad-landscape.jpg), [midpoint](screenshots/zebra-middle-ipad-landscape.jpg), [near-catch](screenshots/zebra-near-aster-ipad-landscape.jpg) and [finale](screenshots/zebra-finale-ipad-landscape.jpg). A current-source Rainbow Meadow replay on Chromium/Metal at both desktop and iPad-sized viewports confirmed the old world loads without zebra instances, catches normally, and preserves the existing 21-friend save, settings and unrelated storage; the screenshots are not physical-device captures.

The first gameplay review found duplicate speed labels in the iPad-sized near-catch image. Commit `a188461` removes the duplicate transient label while retaining boost feedback in the persistent status pill. Replacement desktop and iPad-sized captures during a natural active boost each show one visible “Sparkle speed!” label. The same reviewer resolved this single finding and returned `ship`; that verdict covers the fix, while the earlier full review remains binding for the other states. Public CI, deployment and live-update gates remain pending.

The review corrected disconnected hoof geometry, terrain alignment, an overly subtle water stream, missing nearby mountain silhouettes, the night sky, and accessible names for the portrait Back button. Celebrations now use a flower-ringed island so the portrait camera cannot enter course scenery. Test-accelerated celebration cameras are settled before capture. The owner's reported reversed steering was corrected in the lateral basis, camera basis and road winding, with unit and browser screen-direction regression checks.

## Performance choices

WebGL rendering; no WebGPU or postprocessing. Scenery is merged by material into spatial chunks. Props use lower-detail meshes than characters. Roadside grass and pebbles use spatially chunked instancing, and terrain color variation and the sky each render without additional texture downloads. Particle count is bounded at 160; water adds fourteen small droplets while active. Pixel ratio starts at at most 1.5 in Automatic, can be reduced after a sustained slow frame sample, and can be set to Gentle (1) or Crisp (at most 2). Automatic/Crisp use a single 1024 px directional shadow map; Gentle uses soft contact shadows. Automatic also disables the shadow map when the sustained slow-frame threshold is reached. Original compressed font is approximately 33 KB; authored potion approximately 28 KB; JavaScript approximately 193 KB gzipped.

Geometry and terrain materials created for a world or character, including the instanced planting buffers, are disposed during level changes. Shared primitives, materials and the loaded GLB are reused. The player remains a single persistent model. Context loss displays a reload action; completed progress is already saved. Backgrounding pauses active play.

Coral Lagoon adds a fixed school of 24 reef fish and one instanced draw for 64 bubbles. Christmas Village adds 96 bounded snow flakes. Both use the existing scene clock, so Gentle motion holds their ambient movement still; underwater lighting resets when returning to a daylight world. Fast Food Land uses static food scenery in 16 spatial chunks. On a Mac Apple M2/Metal renderer, the measured chase showed 229 visible calls / 1.34 million triangles at Automatic and 150 / 0.78 million at Low; the 20-friend finale showed 1,199 / 2.93 million at Automatic and 800 / 1.50 million at Low. Bounded 180-frame CPU submission samples ranged from 1.6 ms median / 2.4 ms p95 in Automatic chase to 4.9 / 5.6 ms in the Automatic finale. These are desktop-renderer observations at desktop and iPad-sized browser viewports, not GPU timings or physical iPad performance claims.

## First October graphics validation

The graphics refinement refreshed all 19 gallery captures, including all ten worlds and portrait framing. The terrain, sky and character shaders rendered without browser console errors. A short 180-frame meadow sample in Chromium on this Mac's Apple M2/Metal GPU measured a 16.5 ms median and 19 ms 95th percentile with detailed shadows enabled; this is a desktop observation, not an iPad guarantee. Manual runtime checks verified Gentle/Crisp shadow switching and Automatic's resolution/shadow fallback. Four consecutive meadow replacements retained the same GPU geometry/texture counts. All eight Node tests and ten Chromium/WebKit cases passed after the graphics update.

## Living scenery and butterfly refinement

The next pass adds wind-driven instanced grass, drifting sky clouds, a night aurora, fourteen lily ponds in each of seven applicable worlds, cupped flower petals, blinking faces and articulated pony knees. The six-band boost ribbon follows at most 40 recent player positions and fades over 0.65 seconds. Each particle fades independently. Gentle motion holds the environmental animation still and omits the ribbon; pause freezes the scene clock. The sky and water use existing scene rendering without reflection targets or postprocessing.

The new butterflies have scalloped lobes, borders, veins, edge spots, eyespots and curled antennae in four palettes. Two accompany the rider in the garden; others drift along the verges. The finish review found intersecting butterfly panels and incorrect mirrored-face lighting on Mia’s right wing. Parallel butterfly layers and a mirrored finished fairy-wing group resolved both findings. The reviewer scored both fixes resolved using the refreshed daylight, night and detail captures; that verdict covers the two fixes. All 20 final gallery captures rendered without JavaScript or console errors. The ten-world browser scenario has a 180-second limit because it constructs every world, completes ten physical chases and reloads the collection under software WebGL; the other scenarios retain their 90-second limits.

All eight Node tests and all ten Chromium/WebKit browser cases passed on the final runtime build. A fresh 180-frame meadow sample in Chromium on Apple M2/Metal measured 16.7 ms median and 17.2 ms 95th percentile with mapped shadows enabled. Four consecutive meadow replacements retained 262 GPU geometries and four textures each. This is a short desktop observation, not sustained physical iPad validation.

## Owner's physical iPad check — still required

No physical iPad was used. WebKit automation on macOS is useful Safari-engine coverage, but cannot certify an iPad's thermal behavior, older GPU, browser chrome, speaker levels or a child's hand placement.

1. Open the live HTTPS site in iPad Safari and turn landscape.
2. Play one complete chase with both thumbs; hold an arrow while tapping/holding water.
3. Check the first center puddle jumps automatically and potions noticeably close the gap.
4. Pause, switch apps, return and resume. Rotate the device and return to landscape.
5. Reload after a catch and confirm the friend is saved. Private browsing or cleared storage can remove progress.
6. Try Gentle picture quality if play is choppy; check sound is comfortable.
7. Let the creative director choose the names, coat color, favorite world, and any future water effect. Water is currently harmless decoration.
8. Use Share → Add to Home Screen. Confirm the unicorn icon, standalone launch and safe areas, wait for the install screen's offline-ready message, then close the game and reopen the icon in airplane mode.
9. After the next published release, reconnect and reopen or return to the app. Confirm Update game appears in a menu, the active chase is uninterrupted, and the new world is present after updating with the collection/preferences retained.
10. Share the HTTPS game URL in Messages and check its illustrated card and description. Preview layout and caching are controlled by the messaging app; a previously shared link may retain an older preview.

## Known limits

- Save data stays in this browser, with no cross-device sync; clearing site data removes it. The custom-domain origin and the GitHub hostname have separate browser storage.
- Landscape is the primary composition. Portrait shows a turn-device hint and usable menus, but character framing is less generous.
- The initial download and fetching new releases need network access. Offline play requires a complete cached copy; storage eviction or clearing site data can remove it. Saved progress is local to each browser/app and does not sync across devices.
- The original characters use procedural animation, not skeletal GLB animations. All world/name/appearance choices beyond the child's confirmations remain provisional.
- Course lengths and assistance favor finishing over challenge. Idle simulation catches take roughly a minute; potion use can shorten them.

## PWA and sharing references

Implementation follows the [MDN installation and manifest requirements](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable), [app icon guidance](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Define_app_icons), [service-worker lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers), and [Open Graph metadata](https://ogp.me/). These define browser contracts; the tests above establish this game's implementation, and the physical checklist covers device-owned behavior.
