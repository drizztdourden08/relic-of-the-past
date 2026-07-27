/* @layer shared @kind data */
import type { FeatureDef } from './feature.type';
import { BUNDLE_FIXES } from './bundle-fixes.generated';

/**
 * The feature registry — intended as the one place that defines every divergence from vanilla.
 *
 * WIP (not yet wired into the runtime): today only tests/features/ + resolve-features.ts read this; the
 * shipping UI still defines its sections/cascade inline (SettingsView.*). Keep it — it's the planned
 * source of truth (see plans/settings-registry-map.md) — but don't treat it as dead code.
 *
 * NOTE (in progress): this holds the "relic" display/audio/input features plus the resolution
 * dependency tree. The 16 snesrev quality-of-life flags and the 42 individual bug-fix toggles
 * (see plans/_bundle_settings.json) are bulk-imported in a follow-up pass; their FeatureDefs are
 * generated from that catalog so they stay in lockstep with the C gate sites.
 */

// --- Display / aspect ratio --------------------------------------------------
// Rendering dependency tree (plans/settings-registry-map.md §4). UI vocabulary is canonical:
//   extendedRendering (master) → linearWorldTilemap → { ultrawideRendering, tallRendering };
//   cameraLockToViewport → extendedRendering; smoothTransitions → cameraLockToViewport.
// The old aspectRatioWide / experimentalWideRender / tallView entries are retired in favor of these.
const DISPLAY_FEATURES: FeatureDef[] = [
  {
    id: 'extendedRendering',
    label: 'Extended rendering',
    description: 'Master opt-in for every wide/tall/camera enhancement. Off => the core renders pure 4:3 vanilla.',
    userMessage:
      'Unlocks widescreen, tall, and camera enhancements below. Off keeps the original fixed 4:3 view — pixel- and timing-identical to the cartridge, so leave it off for vanilla/speedrun parity.',
    group: 'Display / Aspect',
    kind: 'features0-bit',
    origin: 'relic',
    flag: 'kFeatures0_ExtendedRendering',
    bit: 4194304,
    default: false,
    requires: [],
    suggests: ['cameraLockToViewport', 'widescreenVisualFixes'],
    affectsVanillaParity: true,
    live: false,
  },
  {
    id: 'linearWorldTilemap',
    label: 'Linear world tilemap',
    description: 'Replaces the wrapping 512px SNES BG fetch with a clamped linear read so the view can extend past one screen without tile garbage.',
    userMessage:
      'Lets the view go beyond ~16:10 (and enables tall views) by rendering a contiguous world tilemap instead of the wrapping background. Required before ultrawide or tall.',
    group: 'Display / Aspect',
    kind: 'features0-bit',
    origin: 'relic',
    flag: 'kFeatures0_LinearWorldTilemap',
    bit: 8388608,
    default: false,
    requires: ['extendedRendering'],
    affectsVanillaParity: true,
    live: false,
  },
  {
    id: 'ultrawideRendering',
    label: 'Ultrawide',
    description: 'Raises the horizontal budget cap from ~19:9 up to the engine maximum (~32:9).',
    userMessage:
      'Allows aspect ratios beyond ~19:9, up to ~32:9. Requires the linear world tilemap. Changes a lot of what is on-screen — leave off for vanilla parity.',
    group: 'Display / Aspect',
    kind: 'features0-bit',
    origin: 'relic',
    flag: 'kFeatures0_Ultrawide',
    bit: 16777216,
    default: false,
    requires: ['linearWorldTilemap'],
    affectsVanillaParity: true,
    live: false,
  },
  {
    id: 'tallRendering',
    label: 'Tall view',
    description: 'Adds vertical render budget (extended_aspect_ratio_vertical) above/below the stock 224 rows.',
    userMessage:
      'Shows more of the map vertically (taller-than-4:3). Requires the linear world tilemap. Changes the on-screen area, so leave off for vanilla parity.',
    group: 'Display / Aspect',
    kind: 'features0-bit',
    origin: 'relic',
    flag: 'kFeatures0_TallRender',
    bit: 33554432,
    default: false,
    requires: ['linearWorldTilemap'],
    affectsVanillaParity: true,
    live: false,
  },
  {
    id: 'aspectRatio',
    label: 'Aspect ratio',
    description: 'The chosen screen ratio (extended_aspect_ratio[_vertical]); range is bounded by the capabilities above.',
    userMessage:
      'Pick the screen ratio for the game image. Anything other than 4:3 changes what is on-screen versus the original.',
    group: 'Display / Aspect',
    kind: 'render-geometry',
    origin: 'relic',
    default: false,
    requires: ['extendedRendering'],
    affectsVanillaParity: true,
    live: false,
  },
  {
    id: 'extendY',
    label: 'Extend Y (240 lines)',
    description: 'Renders 240 scanlines instead of the stock 224 (overscan reveal).',
    userMessage:
      'Shows 240 lines instead of the original 224, revealing a little more at the top and bottom. Off = stock 224.',
    group: 'Display / Aspect',
    kind: 'ppu-render-flag',
    origin: 'snesrev',
    default: true,
    requires: ['extendedRendering'],
    affectsVanillaParity: true,
    live: false,
  },
  {
    id: 'widescreenSprites',
    label: 'Widescreen sprites',
    description: 'Extends sprite spawn/despawn ranges so off-screen-in-4:3 sprites are present for the wider view.',
    userMessage:
      'Extends sprite spawn ranges so enemies and objects behave correctly in the wider view. On by default when a wide ratio is active.',
    group: 'Display / Aspect',
    kind: 'features0-bit',
    origin: 'snesrev',
    flag: 'kFeatures0_ExtendScreen64',
    bit: 1,
    default: true,
    requires: ['extendedRendering'],
    affectsVanillaParity: true,
    live: true,
  },
  {
    id: 'widescreenVisualFixes',
    label: 'Widescreen visual fixes',
    description: 'Graphics corrections for sprites/edges that assume a 4:3 screen.',
    userMessage:
      'Corrects sprites and edges that were drawn assuming a 4:3 screen. On by default when a wide ratio is active.',
    group: 'Display / Aspect',
    kind: 'features0-bit',
    origin: 'snesrev',
    flag: 'kFeatures0_WidescreenVisualFixes',
    bit: 1024,
    default: true,
    requires: ['extendedRendering'],
    affectsVanillaParity: true,
    live: true,
  },
  {
    id: 'cameraLockToViewport',
    label: 'Lock camera to the wide view',
    description:
      'Stops the camera at the area boundary so the wide/tall view shows real map to its edges instead of an out-of-area black band.',
    userMessage:
      'Removes the black band at area edges in widescreen by resting the view edge on the map boundary. Shifts the rendered camera, which can affect glitch/speedrun timing. Needs extended rendering.',
    group: 'Display / Aspect',
    kind: 'features0-bit',
    origin: 'relic',
    flag: 'kFeatures0_CameraLockToViewport',
    bit: 262144,
    default: false,
    requires: ['extendedRendering'],
    affectsVanillaParity: true,
    live: true,
  },
  {
    id: 'smoothTransitions',
    label: 'Smooth area transitions',
    description: 'Pans through area seams via a 2-area tilemap instead of the wrapped-edge slice at screen boundaries.',
    userMessage:
      'Removes the wrapped-edge slice at area boundaries by panning through a 2-area tilemap. Requires camera lock.',
    group: 'Display / Aspect',
    kind: 'features0-bit',
    origin: 'relic',
    flag: 'kFeatures0_SmoothTransitions',
    bit: 67108864,
    default: false,
    requires: ['cameraLockToViewport'],
    affectsVanillaParity: true,
    live: true,
  },
  {
    id: 'pauseOffscreenAI',
    label: 'Pause off-screen enemy AI',
    description:
      'Freezes sprite AI in the wide/tall extra band so enemies revealed past the stock 256px screen cannot act before the player sees them.',
    userMessage:
      'In widescreen, stops enemies that the wider view reveals from reacting or raising alarms until they would have been on the original screen. Changes gameplay, so leave off for vanilla parity. Needs extended rendering.',
    group: 'Display / Aspect',
    kind: 'features0-bit',
    origin: 'relic',
    flag: 'kFeatures0_PauseOffscreenAI',
    bit: 2097152,
    default: false,
    requires: ['extendedRendering'],
    affectsVanillaParity: true,
    live: true,
  },
]

// Native-HUD-hide is intentionally NOT a registry feature: it's driven by g_hud_hide_mask via
// WasmSetHudHidden, tied to the existing hudMode='enhanced' setting — not a features0 bit.

// --- Audio -------------------------------------------------------------------
const AUDIO_FEATURES: FeatureDef[] = [
  {
    id: 'perGroupVolume',
    label: 'Independent music / SFX volume',
    description: 'Per-group sub-volume scaling in the DSP so music and sound effects can be mixed separately.',
    userMessage:
      'Lets you set music and sound-effect volumes independently. When off, the emulated audio mix is bit-identical to the original. Turn on to use the separate volume sliders.',
    group: 'Audio',
    kind: 'features0-bit',
    origin: 'relic',
    flag: 'kFeatures0_PerGroupVolume',
    bit: 524288,
    default: false,
    requires: [],
    affectsVanillaParity: true,
    live: true,
  },
]

// --- Input -------------------------------------------------------------------
const INPUT_FEATURES: FeatureDef[] = [
  {
    id: 'haptics',
    label: 'Controller vibration',
    description: 'Emits rumble/haptic events to the host on game events (damage, pickups, etc.).',
    userMessage:
      'Vibrates supported controllers and devices on in-game events. Host-side only — it never changes what the game computes, so it is safe with any other setting.',
    group: 'Input',
    kind: 'host-event',
    origin: 'relic',
    flag: 'kFeatures0_Haptics',
    bit: 1048576,
    default: false,
    requires: [],
    affectsVanillaParity: false,
    live: true,
  },
]

// --- Gameplay (item selection split out of snesrev's SwitchLR bundle) -------
const GAMEPLAY_FEATURES: FeatureDef[] = [
  {
    id: 'inventoryReorder',
    label: 'Reorder inventory',
    description: 'Hold Y + a direction in the inventory to move items around (split out of SwitchLR).',
    userMessage:
      'Lets you rearrange items in the inventory by holding Y and pressing a direction. Not in the original game — leave off for vanilla parity.',
    group: 'Quality of life',
    kind: 'features0-bit',
    origin: 'snesrev',
    flag: 'kFeatures0_InventoryReorder',
    bit: 134217728,
    default: false,
    requires: [],
    affectsVanillaParity: true,
    live: true,
  },
  {
    id: 'secondaryItemSlots',
    label: 'Secondary item slots (X / L / R)',
    description: 'Assign separate items to the X, L and R buttons instead of only Y (split out of SwitchLR).',
    userMessage:
      'Lets you put different items on the X, L and R buttons, not just Y. Not in the original game — leave off for vanilla parity.',
    group: 'Quality of life',
    kind: 'features0-bit',
    origin: 'snesrev',
    flag: 'kFeatures0_SecondaryItemSlots',
    bit: 268435456,
    default: false,
    requires: [],
    affectsVanillaParity: true,
    live: true,
  },
  {
    id: 'autoSkipDialog',
    label: 'Auto-skip dialog',
    description: 'Renders dialog text instantly and auto-advances message-box waits; interactive choice prompts still wait for you.',
    userMessage:
      'Shows dialog text at once and dismisses message boxes for you, including item-get text, without skipping anything that happens when a dialog ends. Yes/no and shop prompts still wait for your answer. Not in the original game — leave off for vanilla parity.',
    group: 'Quality of life',
    kind: 'features0-bit',
    origin: 'relic',
    flag: 'kFeatures0_AutoSkipDialog',
    bit: 536870912,
    default: false,
    requires: [],
    affectsVanillaParity: true,
    live: true,
  },
]

// --- Dev ----------------------------------------------------------------------
const DEV_FEATURES: FeatureDef[] = [
  {
    id: 'developerToolsEnabled',
    label: 'Developer tools',
    description: 'Master gate for developer-only instrumentation hooks, such as the transition-settled event the Navigation widget subscribes to in auto mode.',
    userMessage:
      'Turns on developer-only instrumentation. Host-side and purely observational, so it never changes what the game computes. Off by default; leave off unless a feature you use says it needs this.',
    group: 'Dev',
    kind: 'host-event',
    origin: 'relic',
    flag: 'kFeatures0_DeveloperTools',
    bit: 1073741824,
    default: false,
    requires: [],
    affectsVanillaParity: false,
    live: true,
  },
]

const FEATURES: FeatureDef[] = [
  ...DISPLAY_FEATURES,
  ...AUDIO_FEATURES,
  ...INPUT_FEATURES,
  ...GAMEPLAY_FEATURES,
  ...DEV_FEATURES,
  ...BUNDLE_FIXES, // the 42 split bug-fix toggles (generated)
]

const FEATURES_BY_ID: Record<string, FeatureDef> = Object.fromEntries(FEATURES.map((f) => [f.id, f]))

export { FEATURES, FEATURES_BY_ID, DISPLAY_FEATURES, AUDIO_FEATURES, INPUT_FEATURES, GAMEPLAY_FEATURES, DEV_FEATURES }
