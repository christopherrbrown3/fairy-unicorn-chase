# Creative decisions

## Confirmed by the child — preserve
Fairy Unicorn Chase. Mia has blonde hair, a blue dress, fairy wings and water-spray powers; she rides Glender. Glender has yellow hair and stars on her body. Ten white unicorns have different-colored hair. Friendly chase, one unicorn in each of ten different magical settings; catch to advance and catch all ten to win. Sparkly potions are speed-ups. Automatic jumps over suitable obstacles. Simple iPad steering with a gentle arcade racing rhythm.

## Provisional — easy to change
- Glender's coat: warm peach/apricot, with golden star markings.
- Mia's look: round storybook proportions, long sculpted blonde locks, translucent blue wings, blue petal skirt and small flower crown.
- World names and mane assignments follow the suggested ten-world table.
- Unicorn nicknames: Blossom, Violet, Skye, Sunny, Clover, Amber, Rosie, Ripple, Lilac and Prism. These are suggestions, not child-confirmed names.
- Water is joyful cosmetic magic only. It never hurts or slows the unicorn, and is optional to win.
- Chase tuning: auto-run, generous lanes and boundaries, four-second potion boosts, subtle assistance after a longer chase. Catch always depends on real distance and lane alignment.
- UI: illustrated storybook adventure with large soft blue controls, paper menus, pink accents and original icon artwork. All visual choices can be revised by the creative director.
- Music and effects: original synthesized chimes, hoofbeats and gentle melodic accompaniment. No downloaded game sounds.

## Artistic ownership
Models and scenery are original procedural artwork, with a Blender-authored potion asset. No copyrighted racing-game characters, artwork, sounds or tracks are used.

## Tuning and implementation choices
Current baseline speed is 10 world units/second. A potion adds 4.6 in the introductory meadow and 2.5 in later worlds, for four seconds; lane limits stay generous during boosts. The first lead is 54 units; later leads 67.5–79.5. Assistance starts at 30 seconds in the meadow and 45 in later worlds, gradually easing unicorn speed. Capture requires separation at most 3.8 units plus generous lane alignment. Looped courses prevent unwinnable endpoints. Deterministic no-steering play catches the first unicorn in about 23 seconds and later friends in 61–70 seconds; steering toward more bottles can finish sooner.

White unicorns have soft lilac hooves, friendly pink muzzles and gold horns. Mane and tail color both vary; Prism has rainbow locks. Celebrations gather Mia, Glender and the caught friend on a flower-ringed island, with hearts, sparkles and an actual 3D rainbow. This clear presentation prevents nearby course scenery from obscuring the portrait camera. The finale adds all ten unicorns.

Asset reuse licensing for original code/art/audio remains unassigned. Third-party software and the self-hosted Baloo 2 font retain their licenses in docs/CREDITS.md.
