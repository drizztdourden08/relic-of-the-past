/* @layer shared-features @kind data */
/**
 * Settings Vanilla Safe already neutralizes at runtime but which own no FeatureDef. The settings
 * lock reads `affectsVanillaParity` off the registry, which only covers gate-word bits; the custom
 * sprite and replacement soundtrack are forced off in the INI, the custom HUD and cheats are
 * stripped from gate word 3, and two renderer toggles are hand-gated in buildPpuFlags. Without
 * this list those controls stayed enabled while doing nothing.
 *
 * Membership is a claim about RUNTIME behavior: a key belongs only once something forces it off.
 * `newRenderer` is deliberately absent (a pure engine swap that stays on), as are host-side
 * preferences (volumes, saves, window and scaling) that never reach the emulated game.
 */

const VANILLA_SAFE_LOCKED_SETTINGS: readonly string[] = [
  // Cheats: gate word 3 drops every cheat bit under Vanilla Safe (buildFeatureWord3).
  'cheatsEnabled',
  // Replacement soundtrack: serializeToIni emits MSU off and withholds the pack path.
  'enableMSU',
  'resumeMSU',
  'resetMSUAtTitle',
  'packReplaceAmbient',
  'packReplaceSfx',
  // Custom player sheet: serializeToIni withholds LinkGraphics, and the override bit is masked.
  'linkSprite',
  // Custom HUD and pause overlay: the HudOverride bit is masked, so the native HUD is restored and
  // every style option below it describes an overlay that is no longer drawn.
  'hudMode',
  'hudEnhancedParts',
  'hudStyle',
  'hudRatio',
  'hudHeartMode',
  'hudMagicMode',
  'hudCountLayout',
  'hudPauseStyle',
  'hudPauseHighlight',
  // Renderer effects that visibly differ from the cartridge, hand-gated in buildPpuFlags.
  'enhancedMode7',
  'noSpriteLimits',
];

/** Haptic settings are nested, so they arrive as dotted keys (`haptics.swordSwing`). */
const HAPTICS_KEY_PREFIX = 'haptics';

const LOCKED = new Set(VANILLA_SAFE_LOCKED_SETTINGS);

/**
 * True when Vanilla Safe already switches this key off without the registry knowing. The whole
 * haptics group qualifies: its master flag is stripped from features0 and again by the C-side
 * parity mask, so every per-event toggle under it is inert.
 */
const isVanillaSafeLockedSetting = (key: string): boolean =>
  LOCKED.has(key) || key === HAPTICS_KEY_PREFIX || key.startsWith(`${HAPTICS_KEY_PREFIX}.`);

export { VANILLA_SAFE_LOCKED_SETTINGS, isVanillaSafeLockedSetting };
