/* @layer shared @kind types */
/**
 * Single source of truth for every enhancement that diverges from vanilla zelda3. One FeatureDef
 * per toggle; the C flag, INI key, TS flag map, settings UI and dependency rules derive from these
 * (plans/zelda3-settings-plan.md).
 */

/** How the feature is enforced in the engine. */
type FeatureKind =
  | 'features0-bit' // a bit in enhanced_features0 (or features1 once we overflow uint32)
  | 'render-geometry' // a g_config value (e.g. extended_aspect_ratio) applied at restart
  | 'ppu-render-flag' // a ppu->renderFlags bit
  | 'host-event' // gated host callback (haptics)
  | 'cheat' // neutral-by-default cheat
  | 'dev'; // developer-only, compiled out of release

type FeatureGroup =
  | 'Display / Aspect'
  | 'Display / HUD'
  | 'HUD'
  | 'Audio'
  | 'Input'
  | 'Quality of life'
  | 'Bug fixes'
  | 'Cheats'
  | 'Dev';

/** Who introduced the divergence. snesrev features are already gated upstream (we expose them); relic ones are ours. */
type FeatureOrigin = 'snesrev' | 'relic';

interface FeatureDef {
  id: string;
  label: string;
  description: string;
  /** In-settings copy shown to the user: requirements and any parity disclaimer. */
  userMessage: string;
  group: FeatureGroup;
  kind: FeatureKind;
  origin: FeatureOrigin;
  /** For split bug-fixes: the snesrev bundle they were extracted from (drives legacy-setting migration). */
  bundleOrigin?: 'MiscBugFixes' | 'GameChangingBugFixes' | 'WidescreenVisualFixes';
  /** C symbol gating it, e.g. 'kFeatures0_CameraLockToViewport' (omitted for render-geometry/cheat). */
  flag?: string;
  /** Which bitmask word holds it: 0 = enhanced_features0, 1 = features1, 2 = features2 (split bug-fixes). */
  word?: number;
  /** Bit value (1 << n) within its word for features*-bit kinds (the registry owns allocation). */
  bit?: number;
  default: boolean;
  /** The resolver disables this feature unless every one of these hard dependencies is enabled. */
  requires: string[];
  /** Soft companions the suggestion card offers, but does not force, when this is turned on. */
  suggests?: string[];
  /** True ⇒ shifts render output / RAM when on; gets the "leave off for vanilla/speedrun parity" disclaimer. */
  affectsVanillaParity: boolean;
  /** False ⇒ requires a restart to take effect. */
  live: boolean;
}

export type { FeatureDef, FeatureKind, FeatureGroup, FeatureOrigin };
