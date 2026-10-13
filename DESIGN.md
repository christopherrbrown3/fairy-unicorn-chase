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

Rounded original 3D figurines inhabit magical pastel landscapes. Flowing tapered hair, layered eyes, butterfly wings and a scalloped dress give the characters their storybook detail. Textured curving paths, planted verges, layered hills and recognizable landmarks supply environmental depth. The interface uses warm paper, sturdy rounded lettering and generous controls to keep that world readable.

The world remains animated behind the title and celebrations. Paper menus provide a quieter place to choose worlds and revisit friends. Preserve Mia's blonde hair, blue dress and wings; Glender's yellow mane, yellow tail and body stars; and white unicorn bodies with distinct mane colors. Exact provisional appearance choices remain in `DESIGN_NOTES.md`.

**Key Characteristics:**

- Expressive dimensional characters and richly planted scenery, with original artwork.
- Warm paper, blue actions, navy ink and pink/gold accents.
- Large icon-led controls and short, friendly labels.
- Galloping, wing motion, water magic and shared celebrations.

Recorded from `src/styles/game.css`, `src/ui/view.js`, `src/game/scene.js` and their art/config dependencies after the finish review. Surface composition and the five-block built contract are in `.impeccable/surfaces/src-main-js.md`; visitor mode belongs there. No design comp was selected.

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

Shared mesh materials normally use roughness 0.72. Hair, wings and quartz use smoother materials; terrain uses roughness 0.96 with world-space color variation and feathered path edges. Chunked geometry and instanced grass/pebbles keep the richer scenery bounded without postprocessing or external terrain textures.

UI elevation uses blurred tinted shadows: shared ambient lift, blue-tinted primary lift and a broader pause-sheet shadow. Exact values live in the sidecar alongside touch-control shadows. The title retains a light text-shadow for lettering separation.

**The Soft Lift Rule.** Raised interface surfaces use blurred, tinted shadows; do not restore the removed hard offset primary-button shadow.

## Shapes

Sculpted rounded silhouettes define characters and much of the scenery. Hair locks taper into flowing ends; blue/lilac butterfly wings carry pearl-colored contours and veins; the blue dress has a scalloped hem. Branching trees, arched castle openings, faceted quartz and floating cloud islands retain recognizable forms.

Corners are purpose-based: tile, control, sheet and steering radii are recorded in frontmatter. Sound, pause and water use circles. Original inline SVG icons use rounded caps and joins, with 2.5-unit default strokes in a 32-unit viewBox and heavier steering arrows.

## Components

### Buttons

Generous actions combine an SVG icon with a concise label. Standard and jumbo actions use the base dimensions in frontmatter. Labeled Back controls use the control radius rather than a circle. Enabled hover brightens by 4%; active buttons move down 3px. Transform/background transitions take 0.18 seconds, with the shared curve for transform. Keyboard focus uses a 4px pink outline, offset by 5px.

### Adventure Tiles

World tiles combine the configured sky color, an original landmark SVG, a rendered unicorn portrait, a state icon and a name. Collection tiles alternate pastel grounds and use the same portrait family. Locked worlds are disabled. Unknown friends are dark low-opacity silhouettes with a lock; caught friends reveal full color and their configured names. Preserve meaningful accessible labels when changing artwork.

### HUD and Touch Controls

Translucent paper surfaces show the world and chase progress while scenery stays visible. Progress scales from its left edge with a 0.2-second transform transition. Encouragement and boost labels disappear when empty. Steering uses large rounded arrows; water uses a circular droplet. Held states change background and move down 3px. Sustained steering and water input use their own touch handling.

### Pause Sheet and Preferences

A warm-paper sheet groups Resume, Restart and Home with compact sound, picture-quality and gentle-motion settings. The native select has a rounded cool ground and a 44px minimum height; the checkbox uses primary blue. Preserve the shared focus treatment.

### Celebration Stage

Course scenery is hidden for a clear flower-ringed island, a physical rainbow, floating hearts and sparkles. A catch frames Mia, Glender and the newly found unicorn; the finale frames Mia, Glender and all ten unicorns. Copy sits above the family and actions below it. Maintain this clear portrait stage so nearby trees or buildings cannot obscure the group.

Gallop, wing motion, hovering potions and camera damping supply motion. Gentle motion removes boost camera widening and reduces celebratory movement; the CSS reduced-motion preference removes transitions and animation. Keep the scene visible throughout state changes.

## Do's and Don'ts

### Do:

- **Do** preserve confirmed character colors, powers and recognizable silhouettes.
- **Do** reuse the paper/blue/ink hierarchy while each world contributes its own scenery.
- **Do** retain large touch targets, visible keyboard focus and safe-area clearance.
- **Do** keep portraits and celebrations unobstructed, with all ten friends visible in the finale.
- **Do** keep provisional names, coat choices and tuning editable through configuration and documented in `DESIGN_NOTES.md`.

### Don't:

- **Don't** add an eyebrow above the title or restore the removed hard offset primary shadow.
- **Don't** replace original icons or dimensional artwork with glyph icons or placeholder figures.
- **Don't** add text-heavy instructions or developer controls to the play surface.
- **Don't** treat browser viewport captures as physical iPad performance or touch validation.

The sidecar extends the frontmatter with exact shadows, motion, responsive thresholds and component samples. Its synthesized tonal ramps are palette previews only, not additional shipped color tokens.
