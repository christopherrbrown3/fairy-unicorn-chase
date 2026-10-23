# Release history

## v1.14.0 — Splash Water Park

World 21 adds Dipper, a white unicorn with a saffron mane, to a dimensional
water park. Curving open flumes, an enclosed tube, twin racers, raised decks,
connected stairs and supports lead into modeled receiving pools. A shallow
splash-play pool, bucket, water wheels, umbrella loungers, float racks and
planters fill the middle and foreground around a broad dry promenade. The
course adds no new controls, water hazard or failure state.

The opening views show an uncollected blue potion ahead; the natural near-catch
views show Dipper on the same dry path:
[desktop opening](screenshots/waterpark-opening-desktop.jpg) ·
[middle](screenshots/waterpark-middle-desktop.jpg) ·
[near Dipper](screenshots/waterpark-near-dipper-desktop.jpg) ·
[iPad opening](screenshots/waterpark-opening-ipad-landscape.jpg) ·
[middle](screenshots/waterpark-middle-ipad-landscape.jpg) ·
[near Dipper](screenshots/waterpark-near-dipper-ipad-landscape.jpg).
The complete twenty-one-friend finale fits both views:
[desktop](screenshots/waterpark-finale-desktop.jpg) ·
[iPad landscape](screenshots/waterpark-finale-ipad-landscape.jpg).
[Rainbow Meadow preservation](screenshots/waterpark-meadow-preservation.jpg)
shows the original course after selecting it from the expanded world list.

Existing saves with all twenty earlier friends unlock Splash Water Park while
preserving progress, sound/picture/motion settings and unrelated browser data.
Focused Chromium/Metal and WebKit checks completed Dipper's catch, collection,
21-friend finale, reload and preferences. The independent visual review cleared
all eight route/finale views. Local validation passed 24 unit tests and the
production build. The custom slide shells retain their indexed inner/outer
surfaces and opposing floor normals through static batching; source smoke also
confirmed all 413 owned world geometries are disposed on replacement.

On the verified Apple M2/Metal Chromium renderer, the near-chase view submitted
about 904,000 visible triangles and 226 calls at Automatic, or 486,000 / 146 at
Low. The 21-friend finale submitted 3.00 million triangles and 844 calls at
Automatic, or 1.51 million / 427 at Low. Bounded 180-frame CPU render-submission
samples measured 1.1 ms median / 2.0 ms p95 for Automatic chase and 4.5 / 5.1 ms
for the Automatic finale. These measurements are not GPU timings or physical
iPad performance claims; the tablet images use an iPad-sized browser viewport.
Research, geometry inventory and visual evidence are in the [Water Park
brief](WORLD_THEME_RESEARCH.md#world-21-visual-inspection-and-implementation--october-23).

## v1.13.0 — Fast Food Land

World 20 adds Sesame, a white unicorn with a rose mane, to a colorful fast-food
course filled with dimensional burgers, fries, pizza and milkshakes. Meal trays,
booths, diners, kiosks and terraces form linked foreground, middle and background
scenes around a broad playable road. Existing saves with all nineteen friends
unlock Fast Food Land while retaining completed worlds, preferences and unrelated
browser storage. The twenty-friend finale fits both desktop and tablet landscape
views.

The approved route review covers the opening, middle chase and natural near catch
at desktop and iPad-landscape browser viewports:
[desktop opening](screenshots/fast-food-opening-desktop.jpg) ·
[middle](screenshots/fast-food-middle-desktop.jpg) ·
[near Sesame](screenshots/fast-food-desktop-sesame-near.jpg) ·
[iPad opening](screenshots/fast-food-opening-ipad-landscape.jpg) ·
[middle](screenshots/fast-food-middle-ipad-landscape.jpg) ·
[near Sesame](screenshots/fast-food-ipad-landscape-sesame-near.jpg).
The desktop opening capture shows a blue potion pickup ahead.
The twenty-friend finale is shown at both sizes:
[desktop](screenshots/fast-food-finale-desktop.jpg) ·
[iPad landscape](screenshots/fast-food-finale-ipad-landscape.jpg).

Local checks passed 23 unit tests, the production build, and focused migration,
chase, catch, collection, finale, reload, preferences and preservation scenarios
in Chromium/Metal and WebKit. A genuine nineteen-friend save unlocked the new
world and retained settings and unrelated storage. Review confirmed the food
forms, layered route, Sesame, blue potion and complete finale. The density and
source observations are in the [research brief](WORLD_THEME_RESEARCH.md#world-20-visual-inspection-and-implementation--october-23).
Measurements on this Mac's Apple M2/Metal renderer found 229 visible calls and
1.34 million triangles in the automatic-quality chase, and 150 calls / 0.78
million triangles in low quality. The twenty-friend finale measured 1,199 calls
and 2.93 million triangles in automatic quality, and 800 / 1.50 million in low
quality. Across 180 submitted frames, median/p95 CPU submission time was
1.6/2.4 ms in automatic chase quality and 1.0/1.5 ms in low; finale samples were
4.9/5.6 ms and 4.1/4.7 ms. These measurements use a Mac desktop renderer at
desktop and iPad-sized browser viewports; they are not GPU timings or physical
iPad results. Physical iPad playtesting remains outstanding.

The GitHub release notes record the deployment, bundle/cache hashes, safe update
from v1.12.0, preserved save/preferences, offline launch, and live gameplay.

## v1.12.0 — Thundermans Town

World 19 adds Bolt, a white unicorn with a bright blue mane, to a super-powered
neighborhood of family homes, open labs, gadget displays, twin-power landmarks,
rabbit statues and thunder pylons. Existing saves with all eighteen earlier
friends unlock Thundermans Town while preserving collection progress and
preferences. The expanded finale gathers all nineteen friends in three raised
rows while keeping the player, rainbow and controls in view.

The route layers detailed suburban homes and planted yards around the playable
lane, with open gadget labs, twin-power exhibits, rabbit displays and deeper
garden rows. The visual inspiration and what the sources do not establish are
recorded in [the design notes](../DESIGN_NOTES.md#thundermans-town-extension--october-22).

The approved density review covers the opening, middle chase and near catch at
desktop and iPad landscape sizes:
[opening](screenshots/thundermans-town-opening-desktop.jpg) ·
[middle](screenshots/thundermans-town-middle-desktop.jpg) ·
[near Bolt](screenshots/thundermans-town-desktop-bolt-near.jpg) ·
[iPad opening](screenshots/thundermans-town-opening-ipad-landscape.jpg) ·
[iPad middle](screenshots/thundermans-town-middle-ipad-landscape.jpg) ·
[iPad near Bolt](screenshots/thundermans-town-ipad-landscape-bolt-near.jpg).

The desktop opening shows an uncollected potion on the route ahead:
[potion view](screenshots/thundermans-town-potion-visible-ahead.jpg).

The nineteen-friend finale is preserved from the original World 19 visual QA;
the finale/cast code is unchanged by this scenery-only revision:
[desktop](screenshots/thundermans-town-finale-desktop.jpg) ·
[iPad landscape](screenshots/thundermans-town-finale-ipad-landscape.jpg).
The [Rainbow Meadow preservation capture](screenshots/thundermans-town-meadow-preservation.jpg)
also predates the density revision; Meadow and cast assets are unchanged.

Local validation after the density revision passed 23 unit tests, the
production build and focused rendered chase/migration checks in Chromium/Metal
and WebKit. Automatic-quality Apple M2 Metal captures measured about 0.87–0.96
million visible triangles and 266–298 draw calls; bounded frame submission
samples were 3.2–3.4 ms median and 4.0–4.1 ms p95. Low quality measured about
0.65 million triangles, 220–232 calls, and 3.1–3.2/3.7 ms median/p95. These are
desktop measurements, not physical iPad results. Final CI and live release
profile/offline checks are tracked by the release workflow; physical iPad
playtesting remains outstanding.

## v1.11.0 — Sculpted character cast

Mia, Glender and all eighteen unicorn variants use original skinned Blender
models with connected anatomy, painted faces and coats, layered eyes, swept hair,
detailed clothing and tack, and translucent veined wings. Independent skeletons
and blink shapes animate the gallop, jumps, rider suspension and water gesture.
The three compressed character models total 1.8 MB and join the complete offline
cache. Existing progress and preferences carry forward.

![Mia, Glender and a unicorn rendered in the character studio](screenshots/character-cast.png)

[Actual chase view](screenshots/character-chase.png) ·
[Mia and Glender close-up](screenshots/character-mia.png) ·
[Editable source and rebuilding](CHARACTER_ART.md).

Local verification passed 22 unit tests and 31 browser cases across
Chromium/Metal and WebKit; three duplicate WebKit screenshot cases were skipped.
Physical iPad playtesting remains outstanding.

## v1.10.0 — Big City Downtown

World 18 adds Metro, a white unicorn with a periwinkle mane, to a broad city boulevard with pale sidewalks, shopfront awnings, parked taxis, planters, benches, streetlights and clock towers. Existing saves with all seventeen prior friends unlock Big City Downtown while preserving collection progress and preferences.

![Big City Downtown with Metro naturally close ahead at desktop size](screenshots/downtown-desktop-metro-near.jpg)

![Big City Downtown with Metro naturally close ahead at iPad landscape size](screenshots/downtown-ipad-landscape-metro-near.jpg)

The opening course also shows the blue potion pickup: [normal city chase](screenshots/downtown-potion-visible-ahead.jpg).

The eighteen-friend finale, captured at both sizes: [desktop](screenshots/downtown-finale-desktop.jpg) · [iPad landscape](screenshots/downtown-finale-ipad-landscape.jpg). [Rainbow Meadow preservation capture](screenshots/downtown-meadow-preservation.jpg) checks that the original renderer still presents its familiar world.

## v1.9.0 — Pancake Picnic

World 17 adds Maple, a white unicorn with a maple-brown mane, to a sunny breakfast picnic. A blue runner winds past pancake stacks with butter and syrup, golden waffles, strawberries, sunny-side-up eggs, orange halves, toast cottages, and giant fork-and-spoon gates. Existing saves with all sixteen prior friends unlock Pancake Picnic while preserving progress and preferences. The Home Screen version downloads the complete new world before offering its safe menu update; cached releases continue to launch offline.

![Pancake Picnic with Maple naturally close ahead on the path at desktop size](screenshots/breakfast-picnic-desktop-maple-near-v2.jpg)

![Pancake Picnic with Maple naturally close ahead on the path at iPad landscape size](screenshots/breakfast-picnic-ipad-maple-near-v2.jpg)

The seventeen-friend finale, captured at both sizes: [desktop](screenshots/breakfast-finale-desktop-v2.jpg) · [iPad landscape](screenshots/breakfast-finale-ipad-landscape-v2.jpg). [Rainbow Meadow preservation capture](screenshots/breakfast-meadow-preservation-v2.jpg) checks the established daylight course after Pancake Picnic.

## v1.8.0 — Home Screen & sharing

Install Fairy Unicorn Chase on a mobile Home Screen with a custom unicorn icon, standalone launch and offline play after the initial download. The title screen offers installation help and a native installer where available. Shared links include an illustrated image, game title and description.

Installed games check for updates at launch, on returning to the foreground and on reconnecting. New releases download completely before an **Update game** action appears in menus, preserving saved unicorns and preferences. Updates wait through active chases, including in another open tab; a failed download retains the previous working version. No reinstall is needed to receive new worlds.

## v1.7.0 — Christmas Village

World 16 adds Holly, a white unicorn with a cranberry mane, to a snowy village with decorated firs, presents, candy canes, snow friends, cozy cottages and garland gates. Gentle-motion snowfall is bounded and pauses with the scene clock. Existing saves with all fifteen friends unlock Christmas Village while preserving collection progress and preferences.

![Christmas Village with Holly ahead on the path at desktop size](screenshots/christmas-village-desktop-holly-near.jpg)

![Christmas Village with Holly ahead on the path at iPad landscape size](screenshots/christmas-village-ipad-landscape-holly-near.jpg)

The sixteen-friend finale, captured at both sizes: [desktop](screenshots/christmas-finale-desktop.jpg) · [iPad landscape](screenshots/christmas-finale-ipad-landscape.jpg). [Rainbow Meadow preservation capture](screenshots/christmas-meadow-preservation.jpg) checks the established daylight course after the Christmas world.

## v1.6.0 — Coral Lagoon

World 15 adds Pearl, a white unicorn with a sea-blue mane, to an underwater reef of branching coral, kelp, lavender tube sponges, golden sea stars, pearl shells and friendly striped fish. Rising bubbles and the luminous rippled canopy follow Gentle motion. Existing saves with all fourteen friends unlock Coral Lagoon without losing progress or preferences.

![Coral Lagoon with Pearl ahead on the path at desktop size](screenshots/coral-lagoon-desktop-pearl-near.jpg)

![Coral Lagoon with Pearl ahead on the path at iPad landscape size](screenshots/coral-lagoon-ipad-landscape-pearl-near.jpg)

The fifteen-friend finale, captured at both sizes: [desktop](screenshots/coral-finale-desktop.jpg) · [iPad landscape](screenshots/coral-finale-ipad-landscape.jpg). [Rainbow Meadow after changing from the underwater world](screenshots/coral-meadow-preservation.jpg) confirms its daylight colors and familiar scenery return.

## v1.5.0 — Candy Carnival

World 14 adds Taffy, a white unicorn with a coral mane, to a confectionery fairground of peppermint pinwheels, friendly gummy bears, cupcake stalls, sprinkle donut gateways, and tiered cake pavilions. The new course and collection entry unlock for existing saves with all thirteen prior friends preserved.

![Candy Carnival at desktop size](screenshots/candy-carnival-desktop.jpg)

![Candy Carnival at iPad landscape size](screenshots/candy-carnival-ipad.jpg)

The fourteen-friend finale, captured at both sizes: [desktop](screenshots/candy-finale-desktop.jpg) · [iPad landscape](screenshots/candy-finale-ipad-settled.jpg).

## v1.4.0 — New game

Start over from the home or pause menu with **New game**. A confirmation explains that collected unicorns and world unlocks will reset; **Cancel** or Escape keeps the adventure unchanged. Confirming begins a fresh chase in Rainbow Meadow, while sound, picture quality and gentle motion settings stay the same. All fourteen worlds remain available to discover again.

## v1.3.0 — Pokémon Park

World 13 adds Spark, a cobalt-maned white unicorn, alongside friendly Pikachu, Bulbasaur, Squirtle, Poké Ball garden gates, and Pokémon Centers. Existing saves carry forward into the thirteen-friend collection and finale.

![Pokémon Park gameplay](screenshots/pokemon.png)

## v1.2.0 — Minecraft Meadow

World 12 adds Pixel, an emerald-maned white unicorn, grass-and-dirt blocks, cube oaks, diamond ore, torches, block pigs, friendly creepers, and broad mine gateways. The familiar gentle chase and saved progress continue.

![Minecraft Meadow gameplay](screenshots/minecraft.png)

## v1.1.0 — Spooky House

World 11 adds Boo, a white unicorn with a pale-green mane, among moonlit houses, friendly floating ghosts, smiling pumpkins, and illuminated ride-through hallways.

Existing progress is retained. Saves, portraits, collection totals, Continue, and the family finale now follow the released world count. No new controls or failure states.

![Spooky House gameplay](screenshots/spooky.png)
