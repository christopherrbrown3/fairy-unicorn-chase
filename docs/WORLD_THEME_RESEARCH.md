# Nine worlds: research and density brief

Research checked October 23, 2026. This is a design reference and acceptance
brief, not a record of published features. Only world 19 is implemented. Worlds
20–27 remain planning until their individual release gates open. Source facts
are distinguished below from our original scenery decisions. We do not import
show footage, branded product art or museum images into the game.

## Quality contract for every world

Build abundant, varied **dimensional objects in coherent scenes**. Judge density
from the playable chase camera at the opening, middle and near catch on desktop
and iPad landscape. Each frame should show useful foreground detail, grouped
middle-distance activity and a distinct background silhouette. A large count of
identical objects spread across empty terrain does not satisfy this contract.
Keep Mia/Glender, the white friend, blue potion bottles and the broad route easy
to identify. Variation must include shape, pose, scale and grouping, not merely
color. Use shared meshes/materials, spatial batches/culling and bounded dynamic
populations; measure actual render cost alongside visual review. Animation uses
the existing paused/Gentle-motion clock. Protect the sculpted player cast,
controls, earlier world IDs, saves/preferences and complete-release PWA.

## 19 — Thundermans Town / Bolt

**Sources.** Nickelodeon's [Max profile](https://www.nick.com/info-page/ouml5i/max)
identifies his subterranean lair, gadgets, potions and Dr. Colosso the rabbit.
Both [Max](https://www.nick.com/info-page/ouml5i/max) and
[Phoebe](https://www.nick.com/info-page/zu00oa/phoebe) have telekinesis, heat breath
and freeze breath. Phoebe's official profile distinguishes the original teenager
from her later undercover teaching role in Secret Shores. The original
[2013 series announcement](https://ir.paramount.com/static-files/bd566100-e1ce-45ab-9519-063923ebaad7)
describes the twins' secret superhero family premise. This world takes the
original suburban family/lair direction, not the later seaside-school setting.
Warm and cool exhibits represent powers **shared by both twins**, not exclusive
one-power identities.

**Art translation.** Original two-story suburban homes and open, cutaway lab
pavilions make that setting readable from the chase. These are not claimed
replicas of a visually verified television set. Three house variants have
finished side/back windows, siding, dormers or an uninterrupted roof, chimneys,
porch rails/lights/steps, garage windows, driveways, picket borders, flower beds,
hedges and shade trees. Floating books and a ball suggest telekinesis; the exact
objects and their static arrangement are our invention. Shelved bottles,
gauges, vents, monitor bars, pipe runs and coil towers make labs into workshops.
The rabbit remains a friendly display, with no villain combat.

**Audit and change.** The prior opened desktop opening and iPad near-Bolt
captures showed an unobstructed chase but substantial empty lawns, repeated
blank-sided homes, 96 mailboxes and small separated lab ornaments. The old
visual approval predates the user's stronger density requirement. The new
288-slot roadside sequence retains 64 homes and adds their coherent yards,
reduces mailboxes to 32, replaces the other 64 mailbox slots with 32 telekinesis
and 32 garden groups, and retains the rabbit/power/bench vocabulary. Another
64 staggered garden groups form a middle layer. Eight larger homes, eight labs
and eight paired pylon gateways remain landmarks. House variants are
interleaved on both sides, rather than repeated in a single-color run.

**Depth and readability.** Low flower/fence/console details face the route;
shrubs and trees connect the middle-distance houses; roofs and coil towers mark
the background. Regular homes sit 19–22 units from the route center; gardens
and exhibits remain beyond the playable half-width. No new effects, camera,
chase tuning, controls or cast changes. A fresh six-view gameplay packet must
verify that the planted layers reduce bare lawns without hiding Bolt or bottles.
Source metrics and current QA state are in the
[release plan](NINE_WORLD_RELEASE_PLAN.md#world-19-density-revision).

## 20 — Fast food

**Sources.** The official [McDonald's menu](https://www.mcdonalds.com/us/en-us/full-menu.html)
provides burger, fries and chocolate/vanilla/strawberry shake categories;
[Pizza Hut's menu](https://www.pizzahut.com/c/content/menu) supplies the pizza
category reference. Use these food families as observation references, not a
branded restaurant simulation. Our ingredient arrangements and diner are
original art, without brand signs or purchase prompts.

**Dimensional families and density.** Model rounded sesame buns with visible
patty/cheese/ruffled lettuce layers; pizza slices and whole pies with raised
crust, cheese and varied toppings; open cartons full of individually angled
fries; ribbed shake cups with dome/cream/straw details. Add trays, napkin holders,
condiment bottles, order windows, stools and picnic booths. Foreground meal
clusters show ingredient edges; middle-distance kiosks group several foods;
background giant burger diners, pizza awnings and shake towers provide distinct
silhouettes. All four requested foods must be recognizable in each route third.
Avoid repeating breakfast stacks or replacing dimensional toppings with paint.

## 21 — Water park

**Sources.** Manufacturer [WhiteWater's slide catalogue](https://www.whitewaterwest.com/products/water-slides/)
distinguishes enclosed flumes, wall rides, bowls and other slide forms;
[Six Flags' body flumes](https://www.sixflags.com/whitewater/attractions/body-flumes)
describe open flumes ending in a lagoon. These are structural/type references;
our cheerful park layout is invented.

**Dimensional families and density.** Several winding open chutes need concave
cross-sections, tall edges and visible thickness; enclosed tubes need joints and
openings. Support columns, bracing, stairs, landings and rails must visibly
connect slides to ground and tower platforms. Outlets meet modeled pools with
coping, ladders and shallow-water edges. Near the route: grouped rings, chairs,
umbrellas and deck planters; middle: pools and splash-play structures; high
background: layered slide towers with different curves/heights. No unsupported
colored ribbons or a few pool circles on empty grass. Route remains a broad,
safe dry promenade; no new sliding controls, drowning or traffic hazards.

## 22 — Zebra savannah

**Sources.** [San Diego Zoo's zebra reference](https://animals.sandiegozoo.org/animals/zebra)
distinguishes species, sturdy necks, long legs, upright bristly manes, tasseled
tails and individual stripe patterns. Its
[savanna habitat reference](https://animals.sandiegozoo.org/habitats/savanna)
grounds the open grassland setting. Choose **plains zebras**, whose family groups
fit the requested many-zebra experience, rather than mixing Grevy's social
structure and markings indiscriminately.

**Dimensional families and density.** Many actual zebras in visible family/herd
groups, with adult/foal scales, grazing/looking/walking poses, believable equid
heads/ears/hooves and stripes following neck, torso and legs. They need their
own hornless scenery meshes; do not recolor the unicorn cast. Foreground groups
make stripe/body detail readable, middle-distance herds gather around shaded
patches and a waterhole, background groups overlap with grasses and scattered
flat-topped trees. Grass clumps, shrubs, rocks and termite-mound silhouettes
support a coherent African savannah. Every route third must visibly contain
multiple zebras, not one distant icon. Target roughly 60–100 shared-model
animals, adjusted to tested visibility and cost rather than count alone.

## 23 — Yellow brick road to Emerald City

**Sources.** Baum's 1900 novel is the primary story reference, available in the
[Library of Congress scan](https://tile.loc.gov/storage-services/service/rbc/rbc0001/2006/2006gen32405/2006gen32405.pdf)
and [readable book text](https://www.gutenberg.org/files/55/old/wizoz10h.htm).
The novel's road leads toward Emerald City through country, woods and poppies.
The Smithsonian's [ruby-slipper collection record](https://americanhistory.si.edu/collections/object/nmah_670130)
distinguishes the book's silver shoes from the 1939 film's ruby shoes. Default
to book-inspired original scenery; do not silently mix film-specific costume
claims into a book description.

**Dimensional families and density.** An actual yellow-brick surface leads
through low fences, cornfields and a friendly scarecrow scene, then layered
woodland/Tin Woodman/Lion-inspired scenery and abundant poppies. Bricks have
readable seams and bounded geometric/material detail; objects have faces,
clothes/material differences and varied plant silhouettes. Emerald City must
be a **single terminal destination**, revealed ahead with tiered green towers,
ornamented gates, walls and a final plaza. The road must END there. Repeating
green castles around the existing loop fails the request. Plan a world-scoped
finite approach and forgiving catch/arrival state so steering cannot strand the
player, with completion visibly at the city; validate that behavior before art
approval. No hostile witches, combat or punishment is needed.

## 24 — Princesses and princess objects

**Sources.** The official [Disney Princess roster](https://princess.disney.com/)
shows the breadth of recognizable fairy-tale princess characters; it is a
reference to variety, not a requirement to copy those characters. The
[Royal Collection's crown-jewel overview](https://www.rct.uk/collection/stories/the-crown-jewels)
provides dimensional crown, orb and sceptre object families. Historical regalia
are references for materials and construction, not a claim that every princess
wears coronation objects.

**Dimensional families and density.** Create MANY original princess characters,
with different faces, skin tones, hair arrangements, crown forms, layered gowns,
sleeves, trim and standing/seated/greeting poses. They must be visible figures,
not only crowns on cones or distant palace decoration. Use coherent garden-tea,
carriage and ballroom/courtyard gatherings: foreground figures with dress and
face detail; middle groups with mirrors, tiara cushions, bouquets, fans, gift
chests and upholstered seats; background balconies, coach houses, gazebos and
palace wings. Target 40–60 figures with shared topology/variants and enough near
figures in every route third. Preserve Mia's sculpted character assets exactly;
princess scenery uses separate models. No costume-based player changes.

## 25 — Jungle canopy, vines and swinging monkeys

**Sources.** [Smithsonian Tropical Research Institute](https://striresearch.si.edu/rainforest/home/rainforest-layers/)
describes emergent, canopy, understory and forest-floor layers. The
[Los Angeles Zoo's Geoffroy's spider monkey reference](https://lazoo.org/explore-your-zoo/our-animals/mammals/geoffroys-spider-monkey/)
describes long limbs and a prehensile tail used for gripping. Choose a Central
American rainforest with these actual monkeys; apes or lemurs do not substitute.

**Dimensional families and density.** Interlocking crowns and branching trunks
form a visible high canopy; lianas hang between attached branches. Buttress
roots, layered broad leaves, ferns and epiphyte clusters enrich lower layers.
Foreground roots/ferns stay outside the lane, middle vines carry recognizable
long-limbed monkey silhouettes, and taller emergents deepen the background.
Several monkeys must visibly swing in normal play, with gripping hands/tails
and believable suspended pivots; vary perches and poses for others. Target a
bounded 18–24 animated monkeys plus static groups, adjusted after measured QA.
Use the shared scene clock: pause freezes their exact pose; Gentle motion holds
a clear static pose. Repeated low palm trees on bare grass do not make a jungle.

## 26 — Valentine's Day

**Sources.** The [V&A card collection overview](https://www.vam.ac.uk/articles/a-brief-history-of-valentines-cards)
includes bouquets, hearts, mechanical cards and delicate paper structures;
[its Victorian-valentine conservation article](https://www.vam.ac.uk/blog/caring-for-our-collections/victorian-valentines)
discusses paper lace. We use affectionate card/craft motifs and omit the
collection's insulting historical cards. This is a welcoming friends-and-family
celebration.

**Dimensional families and density.** Folded and pop-up cards with layered lace
edges, envelopes with modeled flaps/seals, bouquet beds, ribbon-wrapped presents,
heart-shaped confection boxes and small postal/craft kiosks. Foreground objects
show paper thickness, bows, stems and petals; middle scenes group a card-making
table, delivery baskets and garden benches; background floral conservatories,
rose trellises and large open-card pavilions vary the skyline. Hearts should be
integrated into objects and planting, not identical giant heart arches repeated
on an empty lawn. Keep red/pink accents distinct from the white friend and blue
pickups; no romance choices, gifting purchases or extra controls.

## 27 — Dense temperate forest with woodland creatures

**Sources.** [Illinois DNR's deciduous-forest description](https://dnr.illinois.gov/education/cdhabitatmain/cdhabitatuplanddeciduousforest.html)
identifies oak/beech/hickory/maple canopy, smaller trees/shrubs and a floor of
fungi, ferns, moss and wildflowers. [Shenandoah National Park's mammal account](https://home.nps.gov/shen/learn/nature/mammals.htm)
and [species checklist](https://www.nps.gov/shen/learn/nature/upload/508_SHEN_SpeciesChecklist_Mammals.pdf)
ground a coherent eastern North American woodland animal selection, including
white-tailed deer and gray squirrels. Do not combine this with tropical monkeys
or African zebras merely to raise counts.

**Dimensional families and density.** Broadleaf trunks with branches and
interlocking crowns, saplings and shrubs, mossy logs, bracket fungi, fern fronds,
leaf litter, exposed roots and rocky stream edges. Near the lane, visible gray
squirrels, eastern cottontails and raccoons use distinct ears/muzzles/tails and
seated/foraging poses; middle clearings show deer/fawns; background trunks and
canopies overlap densely. Target 40–60 recognizable creatures in coherent small
groups, with multiple animal encounters in each route third. Density must read
as a forest interior, not evenly spaced isolated trees. Keep a sunlit path and
clear sightline to the chased unicorn; animals are friendly scenery.

## Evidence boundaries and handoff

The facts above come from the linked official publishers, museums, government
agencies, conservation institutions and the primary Oz text. Art composition,
counts and gameplay proposals are ours. Sources establish themes and physical
cues, not measured game performance or completed content. The Nick fan hub
redirected regionally, Paramount's show page failed a direct fetch and the Postal
Museum page rejected direct access; none is used to claim inspected screen-set
or object imagery. Revisit specific visual references when each world starts,
then record its implementation and six-view density review in the release plan.
