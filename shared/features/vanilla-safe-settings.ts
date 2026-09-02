/* @layer shared-features @kind data */
/**
 * Settings Vanilla Safe already neutralizes at runtime but which own no FeatureDef.
 *
 * The settings lock reads `affectsVanillaParity` off the feature registry, which only covers settings
 * backed by a gate-word bit. Plenty of divergences are not: the custom sprite and the replacement
 * soundtrack are forced off in the INI, the enhanced HUD and cheats are stripped from gate word 3, and
 * two of the renderer toggles are hand-gated in buildPpuFlags. Every one of those already stops working
 * the moment Vanilla Safe goes on, but each control stayed enabled and inviting, which reads as "this
 * still does something" when it does not.
 *
 * Membership here is a claim about RUNTIME behavior, not a wish: a key belongs only once something
 * actually forces it off, otherwise the lock tells the user a comforting lie. `newRenderer` is
 * deliberately absent for that reason (a pure engine swap that stays on, by its own settings copy), and
 * so are the host-side preferences (volumes, save management, window and scaling options) that never
 * reach the emulated game at all.
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
  // Enhanced HUD and pause overlay: the HudOverride bit is masked, so the native HUD is restored and
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
 * True when this settings key is one Vanilla Safe already switches off without the feature registry
 * knowing about it. The whole haptics group qualifies: its master flag is stripped from features0 and
 * the C-side parity mask strips it again, so every per-event toggle under it is inert.
 */
const isVanillaSafeLockedSetting = (key: string): boolean =>
  LOCKED.has(key) || key === HAPTICS_KEY_PREFIX || key.startsWith(`${HAPTICS_KEY_PREFIX}.`);

export { VANILLA_SAFE_LOCKED_SETTINGS, isVanillaSafeLockedSetting };
