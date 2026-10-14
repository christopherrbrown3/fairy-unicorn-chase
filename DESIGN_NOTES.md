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
Current baseline speed is 10 world units/second. A potion adds 4.6 in the introductory meadow and 2.5 in later worlds, for four seconds; lane limits stay generous during boosts. The first lead is 54 units; later leads 67.5–79.5. Assistance starts at 30 seconds in the meadow and 45 in later worlds, gradually easing unicorn speed. Capture requires absolute along-course separation at most 3.8 units plus generous lane alignment. If the rider overtakes without lining up, the unicorn adjusts its speed to stay alongside within reach; positions are never teleported. Looped courses prevent unwinnable endpoints. Deterministic no-steering play catches the first unicorn in about 23 seconds and later friends in 61–70 seconds; steering toward more bottles can finish sooner.

White unicorns have soft lilac hooves, friendly pink muzzles and gold horns. Mane and tail color both vary; Prism has rainbow locks. Celebrations gather Mia, Glender and the caught friend on a flower-ringed island, with hearts, sparkles and an actual 3D rainbow. This clear presentation prevents nearby course scenery from obscuring the portrait camera. The finale adds all ten unicorns.

Asset reuse licensing for original code/art/audio remains unassigned. Third-party software and the self-hosted Baloo 2 font retain their licenses in docs/CREDITS.md.

## Graphics refinement — October 2026

The owner requested improved graphics within the existing playable storybook. Characters now have tapered flowing locks, layered eyes, a scalloped dress and blue/lilac butterfly wings with pearl-colored veins. The ten mane assignments and confirmed child character traits remain the visual anchors.

Worlds use textured soil and grass, feathered path edges, layered hills, grass clumps and pebbles, clustered flowers, branching trees, faceted quartz, arched castle windows and floating cloud islands. A continuous horizon sky and level-specific key/fill/rim lighting distinguish daytime and moonlit worlds. Fairy lights drift beside the route; Gentle motion holds them still.

One 1024 px directional shadow map adds character and nearby scenery shadows in Automatic/Crisp. Gentle uses soft contact shadows; Automatic can drop the shadow map and resolution after a sustained slow frame sample. Instanced grass and stones are split into spatial chunks. No postprocessing or external texture downloads are required. Physical iPad performance still needs a device check.

## Further graphics refinement — living scenery

The second graphics request adds drifting billowed clouds, a soft aurora in Starlight Valley, wind-bent grass and rippling lily ponds with reeds and stones. Ponds appear in the meadow, forest, castle, crystal, garden, night and palace settings. They are scenery outside the playable path. Flowers have eight cupped petals and detailed centers.

Mia has layered blonde hair down her back, a pale embroidered hem, tiny dress stars and a small nose and eyebrows. Mia and the ponies blink at staggered intervals. The ponies have bending knees, subtle head movement and spiral gold horns on the unicorns. These are provisional additions to the confirmed character traits.

Potion speed leaves a six-color ribbon following Glender's actual travelled path, including turns and jumps. It fades over 0.65 seconds and keeps at most 40 samples. Magic particles have a soft four-point sparkle and individual lifetime fades. Gentle motion freezes the sky, wind and water and omits the ribbon. Pause freezes the scene clock. The sky, ponds and ribbon each use one rendering pass rather than extra reflection or postprocessing passes.

The owner's butterfly feedback prompted a separate model replacement. Garden butterflies now have scalloped upper and lower lobes, thin patterned wings, radial veins, contrasting borders, cream edge spots and paired eyespots. Small bodies, eyes and curled antennae complete their silhouettes. Four coordinated color varieties flutter on separate hinges and drift along the verges; two garden butterflies accompany the rider so their patterns remain visible during play. Smaller butterflies appear in the meadow, forest, castle and palace. Mia's blue/lilac wings gain delicate eyespot motifs and a pearlescent material whose sheen changes with the viewing angle.

The finish review identified intersecting butterfly wing layers and a dark mirrored fairy wing. Butterfly panels now remain parallel through their hinged flutter; mirroring Mia’s entire finished wing preserves its face winding and blue/lilac lighting. These changes retain the same character palette and controls.

## October 14 additions

The creative director requested Spooky House, Minecraft, and Pokémon, in that order. Each is a separate task and release; publish and verify one before implementing the next. Spooky House is gentle: smiling pumpkins, friendly ghosts, moonlit purple houses, and a wide illuminated hallway. Boo and the pale-green mane are provisional. Existing ten-world saves retain their collected friends and unlock world 11.

Minecraft Meadow is world 12, released only after Spooky House was published and verified. Its blocks, oaks, diamond ore, pigs, creepers, and mine gateways use custom procedural geometry. Pixel and the emerald-green mane are provisional. No mining, combat, or new control is introduced.

Pokémon Park is world 13, implemented after Minecraft Meadow v1.2.0 was published and live-verified. It includes custom procedural Pikachu, Bulbasaur, Squirtle, Poké Balls, garden gateways, and Pokémon Centers. Spark and the cobalt-blue mane are provisional. Pokémon are friendly scenery; the unicorn chase, existing controls, and saved collection continue.
