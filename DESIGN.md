---
name: Fairy Unicorn Chase
description: A playable pastel storybook with rounded 3D characters and welcoming touch controls.
colors:
  ink: "#243e62"
  blue: "#2874b8"
  paper: "#fff8ef"
  white: "#fff"
  secondary-control: "#e6eff5"
  focus-pink: "#e76e9c"
typography:
  display:
    fontFamily: "Baloo, ui-rounded, system-ui, sans-serif"
    fontSize: "clamp(56px, 7.2vw, 96px)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Baloo, ui-rounded, system-ui, sans-serif"
    fontSize: "42px"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  button:
    fontFamily: "Baloo, ui-rounded, system-ui, sans-serif"
    fontSize: "23px"
    fontWeight: 700
  button-jumbo:
    fontFamily: "Baloo, ui-rounded, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 700
  supporting:
    fontFamily: "Baloo, ui-rounded, system-ui, sans-serif"
    fontSize: "20px"
rounded:
  tile: "16px"
  control: "18px"
  sheet: "24px"
  steering: "30px"
  circle: "50%"
spacing:
  compact: "8px"
  small: "12px"
  medium: "14px"
  related: "16px"
  group: "20px"
  inset: "24px"
  large: "28px"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "14px 28px"
    height: "66px"
  button-primary-jumbo:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    typography: "{typography.button-jumbo}"
    rounded: "{rounded.sheet}"
    padding: "17px 38px"
    height: "88px"
  button-secondary:
    backgroundColor: "{colors.secondary-control}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "14px 28px"
    height: "66px"
  button-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "14px 28px"
    height: "66px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "14px 8px"
    height: "72px"
  button-round:
    backgroundColor: "#fff8efef"
    textColor: "{colors.ink}"
    rounded: "{rounded.circle}"
    height: "72px"
    width: "72px"
  button-steering:
    backgroundColor: "#fff8efcf"
    textColor: "#335b7b"
    rounded: "{rounded.steering}"
    height: "110px"
    width: "124px"
  button-water:
    backgroundColor: "#a1dbefdd"
    textColor: "#2e77a2"
    rounded: "{rounded.circle}"
    height: "100px"
    width: "100px"
  pause-sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "34px 40px"
    width: "560px"
---

# Design System: Fairy Unicorn Chase

## Overview

**Creative North Star: "The Playable Storybook"**

Original sculpted 3D characters inhabit magical pastel landscapes. Blender-authored skinning, painted coat and facial color, layered blinking eyes, flowing tapered hair, pearlescent fairy wings and a folded scalloped dress give the cast its storybook detail. Patterned butterflies, wind-bent grass, drifting clouds and rippling lily ponds animate the planted scenery around textured paths and recognizable landmarks. The interface uses warm paper, sturdy rounded lettering and generous controls to keep that world readable.

The world remains animated behind the title and celebrations. Paper menus provide a quieter place to choose worlds and revisit friends. Preserve Mia's blonde hair, blue dress and wings; Glender's yellow mane, yellow tail and body stars; and white unicorn bodies with distinct mane colors. Exact provisional appearance choices remain in `DESIGN_NOTES.md`.

**Key Characteristics:**

- Sculpted, skinned characters with expressive faces, distinct material surfaces and original artwork; patterned butterflies and living planted scenery.
- Warm paper, blue actions, navy ink and pink/gold accents.
- Large icon-led controls and short, friendly labels.
- Four-contact galloping, shared rider suspension, hinged wing flutter, water magic, fading rainbow boosts and shared celebrations.

Recorded from `src/styles/game.css`, `src/ui/view.js`, `src/game/scene.js` and their art/config dependencies after the finish review. Character details come from `tools/blender_characters.py` and `src/characters/characters.js`. Surface composition and the five-block built contract are in `.impeccable/surfaces/src-main-js.md`; the character-only refinement is scoped in `.impeccable/surfaces/src-characters-characters-js.md`. Visitor mode belongs in those surface briefs. No design comp was selected. These character records describe the local implementation, not publication, AAA parity or physical iPad performance.

## Colors

Pastel world colors sit behind a stable warm-paper interface. Frontmatter holds reusable interface values; `src/config/levels.js` owns each world's scenery palette. Character, prop and fairy-light colors belong to the original 3D artwork rather than the interface token palette.

### Primary

- **Adventure Blue:** filled Play, Continue and Resume actions; also the native preference-checkbox accent.

### Secondary

- **Cool Control:** neutral menu buttons supporting the next action.
- **Focus Pink:** the keyboard focus outline shared by buttons, select and checkbox.

### Neutral

- **Story Ink:** interface text and inherited SVG strokes.
- **Warm Paper:** menu ground, pause sheet and paper buttons; HUD and touch surfaces use translucent variants over the scene.
- **White:** text on blue actions and the world-tile ground.

Pink chase progress and gold stars/sparkles use component-specific values. They retain the incumbent accent character without becoming primary actions. The unused declared `--pink` and `--gold` properties are not additional canonical palette entries.

**The World Palette Rule.** Keep the interface palette stable across worlds; distinguish worlds through scenery, landmarks and the configured environment colors.

### Character Artwork

Vertex colors supply soft local variation without adding interface tokens. Glender's coat blends warm chestnut (`#cf9269`) into a lighter amber (`#eab78c`), with a peach muzzle and an ivory blaze. Unicorn coats blend warm white (`#fff7ee`) into near-white (`#fffef9`) with a pink muzzle. Mia's face blends peach (`#f7cfb0`) toward rose (`#e6a596`) on the cheeks. These painted values come from the Blender authoring source; the legacy coat, skin, dress and wing fields in `CHARACTER` do not recolor the imported meshes.

Mia and Glender share the configured golden hair (`#ffcf53`). Five material bands vary HSL lightness by `0`, `-0.025`, `0.035`, `-0.055` and `0.065`; unicorns substitute their existing `MANES` color. The rainbow uses rose, gold, mint, sky and lilac bands (`#ed91b5`, `#ffd476`, `#9bd4b2`, `#8acfe9`, `#baa2e2`). Cornflower silk (`#448fce`), indigo piping (`#245a99`) and sky organza (`#a6d8ed`) keep Mia's clothing blue. Leather and champagne gold remain small tack, jewelry and inlay accents.

**The Character Identity Rule.** Preserve Mia's blonde hair, blue clothing and fairy wings, Glender's golden mane and tail with body stars, and white unicorn coats with configured mane colors; richer surface detail must keep these identities readable from the chase camera.

## Typography

**Display and Body Font:** self-hosted Baloo 2, registered as `Baloo`, with `ui-rounded`, `system-ui` and sans-serif fallbacks. Its variable font supplies weights 400–800 under the SIL Open Font License. All interface text inherits this stack; there is no separate body face.

**Character:** round, sturdy and friendly. The title is compressed and oversized; supporting copy stays short enough to read while the scene remains visible.

### Hierarchy

- **Display:** the frontmatter's title role, with three stacked words on the landscape title. Responsive overrides are in the surface brief.
- **Headline:** book and pause headings use the frontmatter role. Celebration headings use `clamp(36px, 5vw, 62px)` with the same weight and tracking.
- **Action:** normal and jumbo button roles in frontmatter; quiet navigation is 21px, weight 700.
- **Supporting:** 20px book/pause copy; title copy is 23px, weight 500, and celebration copy is 21px, weight 500.
- **Compact labels:** 14–16px for progress, preferences and small metadata. World/friend names are larger and heavier than their metadata.

**The Short Label Rule.** Pair actions with the original SVG icons and concise words; reserve reading for menus and brief encouragement.

## Layout

Canvas and UI occupy the viewport. Decorative overlays pass pointer input through; interactive controls receive it. Menus can scroll, while gameplay keeps controls anchored. Main landscape surfaces use `max()` with safe-area insets.

World and collection menus share a five-column grid, a maximum width of 1120px and a 20px gap. A 900px width breakpoint reduces type, artwork and gaps; landscape viewports no taller than 600px use a compact layout. Portrait switches the books to two columns and reserves bottom clearance for a rotation hint. These are implemented responsive rules, not physical iPad test results.

Spacing entries are observed recurring steps, not an implied mathematical scale. Frontmatter component height/width entries describe the base dimensions; button heights are minima and the pause-sheet width is a maximum. Surface-specific placement and responsive control dimensions are in the surface brief.

**The Clear World Rule.** Keep the chase corridor and character silhouettes unobstructed by menus, encouragement and touch controls.

## Elevation & Depth

3D volume, textured paths, a continuous horizon sky, fog and layered hills establish environmental depth. Rendering uses sRGB output and ACES filmic tone mapping at exposure 1.05. Daytime lighting combines warm hemisphere fill (1.65), a warm directional key (2.65) and a cool rim (0.9); night and cave worlds use cooler fill (1.1), a moonlit key (1.7) and a lilac rim.

Automatic and Crisp picture quality enable one 1024 × 1024 PCF directional shadow map centered on the rider. Soft fading contact shadows anchor the rider and chased unicorn in every quality mode; Gentle disables the map. Automatic starts with a pixel-ratio cap of 1.5 and, when the sustained frame sample exceeds 24 ms at frame 300 during play, lowers the ratio to 1 and disables mapped shadows. Crisp caps the ratio at 2. These are implemented performance controls, not a physical iPad performance claim.

Shared scenery mesh materials normally use roughness 0.72; quartz uses a smoother material and terrain uses roughness 0.96 with world-space color variation and feathered path edges. Character meshes use `MeshPhysicalMaterial` with their imported vertex colors. Coat and skin have soft sheen (roughness 0.58, sheen 0.22); hair uses fine longitudinal fibers (roughness 0.43, sheen 0.35, anisotropy 0.45), and blue clothing uses a subtle woven-silk normal map with sheen 0.55. Both deterministic normal maps are 128 × 128 and shared. Layered eyes have clearcoat 1 with clearcoat roughness 0.08. A small PMREM environment (size 128) is shared per renderer and applied only to character materials; environment intensity is 0.22 for coat/skin, 0.7 for eyes and 0.9 for gold.

Mia's four blue/lilac wing membranes are separate, double-sided transparent meshes with opacity 0.56 and depth writing disabled. A center and six surface rings, each sampled at 80 points, follow each curved lobe, avoiding the folded slivers produced by a boundary-only triangulation. Pearl contours, branching veins and eyespot outlines remain modeled above the surface. The runtime membrane uses roughness 0.58, iridescence 0.85, iridescence IOR 1.3, thickness range 180–410 and restrained clearcoat (0.15, roughness 0.65).

**The Membrane Light Rule.** Keep wing membranes independently sortable and lit by the world's lights; their environment map is null and environment intensity is zero so studio-wall reflections do not become dark bands on the curved surface.

Billowed clouds and Starlight Valley's soft aurora share the sky shader. Opaque pond surfaces use painted depth, animated ripples, glints and pale shores without reflection render targets. Chunked geometry, instanced grass/pebbles and a bounded boost ribbon keep the richer scenery within the existing rendering approach, without postprocessing or external terrain textures.

UI elevation uses blurred tinted shadows: shared ambient lift, blue-tinted primary lift and a broader pause-sheet shadow. Exact values live in the sidecar alongside touch-control shadows. The title retains a light text-shadow for lettering separation.

**The Soft Lift Rule.** Raised interface surfaces use blurred, tinted shadows; do not restore the removed hard offset primary-button shadow.

## Shapes

Sculpted rounded silhouettes define characters and much of the scenery. Equine bodies connect the barrel, chest, neck, muzzle and jointed legs through a smoothed continuous surface. Layered eyes combine sockets, pale sclera, iris rings, pupils and two catchlights. Swept hair locks taper into flowing ends with shallow strand relief. Mia has softly sculpted cheeks and nose, lashes, freckles, a small floral crown and riding boots. Her two-layer blue dress uses real folds, tailored seams, a pale scalloped hem and small stars. Four curved wing lobes carry pearl contours, veins and delicate eyespots. Glender's tack uses leather, a blue saddle blanket and gold details; unicorns have pearl constellations, lavender hooves and an ivory horn wrapped by a gold spiral. Flowers use eight cupped petals around detailed centers. Branching trees, arched castle openings, faceted quartz and floating cloud islands retain recognizable forms.

Butterflies have scalloped upper and lower wing lobes, radial veins, contrasting borders, cream edge spots and paired lower-wing eyespots. Their thin painted panels remain flat and parallel as each wing hinges; body, eyes and curled antennae give the small figures dimension.

Corners are purpose-based: tile, control, sheet and steering radii are recorded in frontmatter. Sound, pause and water use circles. Original inline SVG icons use rounded caps and joins, with 2.5-unit default strokes in a 32-unit viewBox and heavier steering arrows.

## Components

### Buttons

Generous actions combine an SVG icon with a concise label. Standard and jumbo actions use the base dimensions in frontmatter. Labeled Back controls use the control radius rather than a circle. Enabled hover brightens by 4%; active buttons move down 3px. Transform/background transitions take 0.18 seconds, with the shared curve for transform. Keyboard focus uses a 4px pink outline, offset by 5px.

### Adventure Tiles

World tiles combine the configured sky color, an original landmark SVG, a rendered unicorn portrait, a state icon and a name. Collection tiles alternate pastel grounds and use the same portrait family. Locked worlds are disabled. Unknown friends are dark low-opacity silhouettes with a lock; caught friends reveal full color and their configured names. Preserve meaningful accessible labels when changing artwork.

### HUD and Touch Controls

Translucent paper surfaces show the world and chase progress while scenery stays visible. Progress scales from its left edge with a 0.2-second transform transition. Encouragement and boost labels disappear when empty. Steering uses large rounded arrows; water uses a circular droplet. Held states change background and move down 3px. Sustained steering and water input use their own touch handling.

### Pause Sheet and Preferences

A warm-paper sheet groups Resume and Restart above a paired Home / New game row, with compact sound, picture-quality and gentle-motion settings. Short landscape places Resume and Restart side by side to keep the menu in view. The native select has a rounded cool ground and a 44px minimum height; the checkbox uses primary blue. Preserve the shared focus treatment.

### New Game Confirmation

The home menu places a labeled New game button beside Sound, clear of the main Play action and book navigation. Home and pause use the same native modal dialog: warm paper, navy text, a soft tinted backdrop and the shared pink focus outline. The dialog explains that collected unicorns and world unlocks reset while preferences stay the same. Cancel is the first, initially focused blue action; Start new game is secondary. Actions sit side by side in landscape and stack in portrait. Escape cancels and returns focus to the originating New game button without resuming a paused chase.

### Celebration Stage

Course scenery is hidden for a clear flower-ringed island, a physical rainbow, floating hearts and sparkles. A catch frames Mia, Glender and the newly found unicorn; the finale frames Mia, Glender and every configured unicorn. The friends are split dynamically into two independently centered rows, currently nine and nine for eighteen worlds. Copy sits above the family and actions below it. Maintain this clear portrait stage so nearby trees or buildings cannot obscure the group.

### Sculpted Storybook Cast

The editable Blender master contains Glender, Mia and a reusable unicorn rig. `tools/blender_characters.py` authors the meshes, smooths and reduces sculpted volumes, paints vertex colors, builds joints and a Blink shape, and exports the three GLBs without baked animation. `npm run art:characters` runs the authoring script in a separate factory-startup Blender process, saves `art/characters/character-masters.blend` and compresses the exports with Meshopt. Runtime motion stays in `src/characters/characters.js`; normal game builds use the committed GLBs. See `docs/CHARACTER_ART.md` for rebuilding and inspection.

Glender and the unicorn rig each have thirteen bones; Mia has eight. Four offset leg contacts bend the upper legs and knees, with a tucked pose for jumps. Rider and tack share Glender's body suspension; Mia adds a small spine response and raises her right arm for water magic. Poses retain the imported bone bases so glTF coordinate conversion and compression do not separate the anatomy. Blink expressions repeat every 4.8 seconds with a 0.22-second closing/opening window and staggered character offsets.

**The Shared Cast Rule.** Reuse loaded geometry and the tiny surface maps while giving each character independent skeletons, blink state and palette materials; release instance materials and skeleton textures when a character leaves the scene.

World changes dispose the replaced unicorn and celebration friends. Scene teardown also releases its character environment target; portrait rendering uses the same GLBs and materials and releases its own environment target after all portraits. The local studio at `art/characters/preview.html` uses that same character code for orbit, cast, gallop and jump inspection, but its page styling and lighting are review aids outside the production build.

### Living Scenery and Magic

Four coordinated butterfly palettes repeat through the planted worlds. Butterfly Garden uses larger figures, including two that accompany the rider; smaller butterflies occupy the meadow, forest, castle and palace verges. Keep their patterns legible through the hinged flutter. Lily ponds sit beyond the playable path, with lily pads, reeds and stones.

A six-color ribbon follows Glender's travelled path during a potion boost, including turns and jumps; it fades over 0.65 seconds and retains at most 40 samples. Magic particles use soft four-point sparkles with individual lifetime fades.

Gentle motion holds scenery animation at a fixed time, omits new boost ribbons and extra boost particles, removes boost camera widening and reduces celebratory movement. Characters retain locomotion, jump poses, body suspension, blinking and the water gesture, while time-driven hair, tail, wing flutter and head turns are suppressed. Steering can still lean the body, mane and tail; wings hold their resting spread. Pause freezes the scene clock; the CSS reduced-motion preference removes interface transitions and animation. Keep the scene visible throughout state changes.

## Do's and Don'ts

### Do:

- **Do** preserve confirmed character colors, powers and recognizable silhouettes.
- **Do** reuse the paper/blue/ink hierarchy while each world contributes its own scenery.
- **Do** retain large touch targets, visible keyboard focus and safe-area clearance.
- **Do** keep portraits and celebrations unobstructed, with every configured friend visible in the finale.
- **Do** keep provisional names and tuning editable through configuration, character appearance editable through its authoring source, and choices documented in `DESIGN_NOTES.md`.
- **Do** keep independent character poses and expressions while sharing geometry and disposing replaced instance resources.

### Don't:

- **Don't** add an eyebrow above the title or restore the removed hard offset primary shadow.
- **Don't** replace original icons or dimensional artwork with glyph icons or placeholder figures.
- **Don't** add text-heavy instructions or developer controls to the play surface.
- **Don't** treat browser viewport captures as physical iPad performance or touch validation.
- **Don't** promote the local character studio's interface, backdrop or lighting into production UI rules.

The sidecar extends the frontmatter with exact shadows, motion, responsive thresholds and component samples. Its synthesized tonal ramps are palette previews only, not additional shipped color tokens.
