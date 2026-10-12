# Implementation plan

The owner's complete brief is the scope. Checked items mean implemented and verified; external completion needs live evidence.

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
