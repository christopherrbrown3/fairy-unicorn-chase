# Quality and device checks

## Automated coverage

Eighteen Node tests cover real pursuit in every world, proximity-only captures after an unaligned overtake, curve closure, steering and recentering, screen-relative lane direction on multiple bends in all sixteen courses, potion speed and expiry, automatic jumps, gentle collisions, cosmetic water, save validation, release-to-release save migration, batched art geometry preservation, bounded reduced-time reef life and snowfall, underwater-atmosphere reset, and unavailable storage.

Browser scenarios run in Chromium and WebKit at 1024 × 768 with touch support. They cover:

- Custom-domain root and repository subpath, entry point, no failed asset requests, runtime errors or shader console errors, and actual Mia/Glender/unicorn meshes and Blender potion.
- Arrow/A/D input with projected on-screen movement matching the arrow direction, held pointer steering, touch water, Chromium two-finger steering plus water, pause/resume and saved sound/picture/motion preferences.
- Potion pickup with actual increased movement speed, automatic jump triggers and gentle obstacle contact.
- Locked worlds, all sixteen genuine distance-based catches, Continue, collection unlocks, sixteen-unicorn finale, reload persistence and unlocked replay.
- Migration from the previous fifteen-world save into Christmas Village, completing Holly, the full collection/finale, preserved preferences and progress, plus New Game reset behavior.
- Corrupt storage recovery, portrait hint and touch targets at least 80 CSS px.

The opt-in `?test=1` API advances the same physical simulation faster. It does not set a catch flag, invent wins or appear as a player-facing menu. These checks verify systems; they do not substitute for a child's playtest.

## Screenshot review

The real rendered game was captured at 1024 × 768. `docs/screenshots/` includes the title, ten worlds, boost, water spray, automatic jump, friendly catch, world menu, collection and final group celebration, plus the 390 × 844 portrait hint. A twentieth capture, `butterfly-detail.jpg`, uses a deliberately close camera to show the actual in-game butterfly model; it is not the ordinary chase view. Release captures add desktop and iPad-landscape gameplay and finale views for later worlds; Coral Lagoon's Pearl-near and Christmas Village's Holly-near views show each friend at a measured natural chase distance, and the accompanying Rainbow Meadow captures check that established scenery returns. The gallery is refreshed after visual changes; file sizes remain suitable for the README.

The review corrected disconnected hoof geometry, terrain alignment, an overly subtle water stream, missing nearby mountain silhouettes, the night sky, and accessible names for the portrait Back button. Celebrations now use a flower-ringed island so the portrait camera cannot enter course scenery. Test-accelerated celebration cameras are settled before capture. The owner's reported reversed steering was corrected in the lateral basis, camera basis and road winding, with unit and browser screen-direction regression checks.

## Performance choices

WebGL rendering; no WebGPU or postprocessing. Scenery is merged by material into spatial chunks. Props use lower-detail meshes than characters. Roadside grass and pebbles use spatially chunked instancing, and terrain color variation and the sky each render without additional texture downloads. Particle count is bounded at 160; water adds fourteen small droplets while active. Pixel ratio starts at at most 1.5 in Automatic, can be reduced after a sustained slow frame sample, and can be set to Gentle (1) or Crisp (at most 2). Automatic/Crisp use a single 1024 px directional shadow map; Gentle uses soft contact shadows. Automatic also disables the shadow map when the sustained slow-frame threshold is reached. Original compressed font is approximately 33 KB; authored potion approximately 28 KB; JavaScript approximately 193 KB gzipped.

Geometry and terrain materials created for a world or character, including the instanced planting buffers, are disposed during level changes. Shared primitives, materials and the loaded GLB are reused. The player remains a single persistent model. Context loss displays a reload action; completed progress is already saved. Backgrounding pauses active play.

Coral Lagoon adds a fixed school of 24 reef fish and one instanced draw for 64 bubbles. Christmas Village adds 96 bounded snow flakes. Both use the existing scene clock, so Gentle motion holds their ambient movement still; underwater lighting resets when returning to a daylight world. These behaviors are covered by unit checks and representative Rainbow Meadow captures. This desktop/WebKit/Chromium coverage is not a physical iPad performance claim.

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

## Known limits

- Save data stays in this browser, with no cross-device sync; clearing site data removes it. The custom-domain origin and the GitHub hostname have separate browser storage.
- Landscape is the primary composition. Portrait shows a turn-device hint and usable menus, but character framing is less generous.
- There is no offline service worker; the initial load needs network access.
- The original characters use procedural animation, not skeletal GLB animations. All world/name/appearance choices beyond the child's confirmations remain provisional.
- Course lengths and assistance favor finishing over challenge. Idle simulation catches take roughly a minute; potion use can shorten them.
