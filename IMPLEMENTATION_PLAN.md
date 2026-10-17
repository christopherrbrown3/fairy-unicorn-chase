# Implementation plan

The owner's complete brief is the scope. Checked items mean implemented and verified; external completion needs live evidence.

## Home Screen and sharing — v1.8.0

- [x] Generate and save unicorn icons and an illustrated share card; wire static share metadata.
- [x] Add a scoped web app manifest, Apple touch icon and device installation help.
- [x] Build a versioned offline cache from emitted production assets.
- [x] Check for new releases on launch, foreground return and reconnection; offer updates in menus while preserving saves and active chases.
- [x] Verify cold offline root/subpath launches, browser installation UI and complete/failed update transitions in Chromium and WebKit.
- [x] Inspect phone/tablet installation and update screens.

The release's publication and live metadata/assets/worker verification are recorded in [PR #11](https://github.com/christopherrbrown3/fairy-unicorn-chase/pull/11). The complete local suite passed 19 Node tests and 29 Chromium/WebKit browser cases; three duplicate WebKit screenshot cases were intentionally skipped. Four focused installation/update cases passed again after the final menu-focus guard and update-notice spacing fix.

Physical Home Screen installation and an actual Messages preview remain device checks; browser automation does not claim those outcomes.

- [x] Inspect empty directory, GitHub account and authoritative DNS.
- [x] Initialize Vite/static foundation and product record.
- [x] Build reusable characters, course, scene and chase camera.
- [x] Deliver playable Rainbow Meadow with touch/keyboard steering.
- [x] Implement real pursuit, potions, automatic jumps and cosmetic water spray.
- [x] Add ten distinct world builders and unicorns.
- [x] Add menus, collection, persistence and ten-unicorn finale.
- [x] Add original audio, animation, quality and resilience.
- [x] Author optimized reusable Blender asset and verify its GLB in Three.js.
- [x] Run deterministic and Chromium/WebKit browser tests, root/subpath checks and screenshot QA.
- [x] Configure public repository, Pages Actions, custom domain and HTTPS; verify live output.
- [x] Finish polished README with genuine screenshots and final audit.

## External evidence so far
Authenticated owner: `christopherrbrown3`. Public repository: https://github.com/christopherrbrown3/fairy-unicorn-chase. Namecheap authoritative nameservers: `dns1.registrar-servers.com`, `dns2.registrar-servers.com`. Authoritative DNS confirms explicit `fuc.christopherbrown.ai → christopherrbrown3.github.io`. Existing wildcard is untouched. Existing account-domain verification TXT is present; Pages reports domain verified. Repository Pages source is Actions, custom domain is configured, certificate approved, HTTPS enforced. Live HTTPS returns 200; HTTP and the GitHub Pages fallback redirect to HTTPS. Actual deployed JavaScript, CSS, font and GLB return 200 and render with zero game console errors.

## Next step
Implementation is complete. The remaining owner activity is a physical iPad/child playtest, then any child-led creative changes. The first CI browser run exposed wall-clock timing assumptions on a slow software GPU; input tests now advance the real simulation after checking actual keyboard/touch input, preserving their assertions. The owner's reported reversed arrows were corrected and verified on the live site, with regression assertions on projected screen position.

## Validation
Eight deterministic tests and ten browser cases passed locally in Chromium and WebKit. Root/subpath asset checks passed. GitHub Actions build, five Chromium cases and Pages deployment passed, including steering-fix run https://github.com/christopherrbrown3/fairy-unicorn-chase/actions/runs/38321320666. Nineteen real screenshots captured and inspected. Independent visual review scored both requested mechanical fixes resolved and returned ship at that scope. The polished README and gallery were committed separately near the end; GitHub's rendered README loaded all seven inline images correctly and every local documentation link exists. Physical iPad testing remains unperformed. See docs/QUALITY.md for the owner's device checklist.

## Graphics refinement — October 13

- [x] Refine characters with flowing tapered hair, layered eyes, butterfly wings and a scalloped dress.
- [x] Add textured paths, planted verges, layered hills, floating islands and detailed castle/quartz landmarks.
- [x] Add daylight/moonlit lighting, a horizon sky, mapped shadows and a low-cost quality fallback.
- [x] Refresh all 19 real screenshots, including character framing on portrait.
- [x] Pass all eight Node tests and ten Chromium/WebKit cases, with corrected steering retained.

The graphics build rendered without browser console errors. A short meadow sample on Apple M2/Metal measured 16.5 ms median and 19 ms p95 with shadows enabled. Quality-mode switching and Automatic fallback were checked at runtime; four consecutive world replacements retained stable GPU resource counts. These are desktop observations; physical iPad testing remains unperformed. Independent visual review found the supplied graphics direction met, with one documentation correction to the stale lighting paragraph.
