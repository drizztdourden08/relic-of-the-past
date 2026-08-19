/* @layer bridge-wasm @kind logic */
/**
 * Vanilla Safe wiring for the live-settings bridge: maps raw GameSettings booleans onto the registered
 * feature ids (shared/features/feature-registry.ts), then runs them through resolveGates so live-settings-flags
 * only has to ask "is this id effective right now" instead of re-deriving the requires/vanillaSafe logic itself.
 */
import type { GameSettings } from '@shared/types/settings';
import { BUNDLE_FIXES } from '@shared/features/bundle-fixes.generated';
import { resolveGates } from '@shared/features/resolve-gates';

// Registered features0-bit ids whose GameSettings field shares the id's name and is requested
// unconditionally (any extra condition, e.g. "only when the ratio is actually wide", is applied by the
// caller on top of effectiveFeatureIds — the resolver only owns the requires/vanillaSafe cascade).
const RAW_FEATURE_KEYS = [
  'extendedRendering', 'linearWorldTilemap', 'ultrawideRendering', 'tallRendering',
  'widescreenSprites', 'widescreenVisualFixes', 'cameraLockToViewport', 'smoothTransitions',
  'pauseOffscreenAI', 'perGroupVolume', 'inventoryReorder', 'secondaryItemSlots', 'autoSkipDialog',
] as const satisfies readonly (keyof GameSettings)[];

/** Every registered feature id currently requested by raw settings, before the resolver prunes it. */
const requestedFeatureIds = (s: GameSettings): string[] => {
  const ids: string[] = RAW_FEATURE_KEYS.filter((key) => Boolean(s[key]));
  for (const fix of BUNDLE_FIXES) {
    // Matches the legacy-bundle fallback in buildFeatureWords: an unset granular toggle inherits the
    // bundle master it was split from (WidescreenVisualFixes-origin fixes also need a genuinely wide ratio).
    const legacy =
      fix.bundleOrigin === 'GameChangingBugFixes'
        ? s.gameChangingBugFixes
        : fix.bundleOrigin === 'WidescreenVisualFixes'
          ? !!s.extendedRendering && s.aspectRatio !== '4:3' && s.widescreenVisualFixes
          : s.miscBugFixes;
    if (s.bugFixToggles?.[fix.id] ?? legacy) ids.push(fix.id);
  }
  return ids;
};

/** Registered feature ids that should actually apply right now: the requested set run through the
 * Vanilla Safe strip + requires-fixpoint (resolveGates). */
const effectiveFeatureIds = (s: GameSettings): Set<string> =>
  resolveGates(requestedFeatureIds(s), { vanillaSafe: s.vanillaSafe }).effective;

export { effectiveFeatureIds, requestedFeatureIds };
