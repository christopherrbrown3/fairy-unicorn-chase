# Quality and device checks

## Automated coverage

Six Node tests cover real pursuit in every world, curve closure, steering and recentering, potion speed and expiry, automatic jumps, gentle collisions, cosmetic water, save validation and unavailable storage.

Five browser scenarios run in Chromium and WebKit at 1024 × 768 with touch support (ten passing browser cases). They cover:

- Custom-domain root and repository subpath, entry point, no failed asset requests or runtime errors, and actual Mia/Glender/unicorn meshes and Blender potion.
- Arrow/A/D input, held pointer steering, touch water, Chromium two-finger steering plus water, pause/resume and saved sound/picture/motion preferences.
- Potion pickup with actual increased movement speed, automatic jump triggers and gentle obstacle contact.
- Locked worlds, all ten genuine distance-based catches, Continue, collection unlocks, ten-unicorn finale, reload persistence and unlocked replay.
- Corrupt storage recovery, portrait hint and touch targets at least 80 CSS px.

The opt-in `?test=1` API advances the same physical simulation faster. It does not set a catch flag, invent wins or appear as a player-facing menu. These checks verify systems; they do not substitute for a child's playtest.

## Screenshot review

The real rendered game was captured at 1024 × 768. `docs/screenshots/` includes the title, ten worlds, boost, water spray, automatic jump, friendly catch, world menu, collection and final group celebration, plus the 390 × 844 portrait hint. JPEGs total approximately 1 MB.

The review corrected disconnected hoof geometry, terrain alignment, an overly subtle water stream, missing nearby mountain silhouettes, the night sky, and accessible names for the portrait Back button. Test-accelerated celebration cameras are settled before capture. Characters stay visible in the approved landscape captures.

## Performance choices

WebGL rendering; no WebGPU or postprocessing. Scenery is merged by material into spatial chunks. Props use lower-detail meshes than characters. Particle count is bounded at 160; water adds fourteen small droplets while active. Pixel ratio starts at at most 1.5 in Automatic, can be reduced after a sustained slow frame sample, and can be set to Gentle (1) or Crisp (at most 2). Original compressed font is approximately 33 KB; authored potion approximately 28 KB; JavaScript approximately 182 KB gzipped.

Geometry created for a world or character is disposed during level changes. Shared primitives, materials and the loaded GLB are reused. The player remains a single persistent model. Context loss displays a reload action; completed progress is already saved. Backgrounding pauses active play.

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
