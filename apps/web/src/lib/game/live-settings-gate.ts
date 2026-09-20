/* @layer bridge-wasm @kind logic */
/**
 * Vanilla Safe wiring for the live-settings bridge: maps raw GameSettings booleans onto the registered
 * feature ids (shared/features/feature-registry.ts), then runs them through resolveGates so live-settings-flags
 * only has to ask "is this id effective right now" instead of re-deriving the requires/vanillaSafe logic itself.
 */
import type { GameSettings } from '@shared/types/settings';
import { BUNDLE_FIXES } from '@shared/features/bundle-fixes.generated';
import { resolveGates } from '@shared/features/resolve-gates';
import { offscreenAiMode } from './settings';
import { rendersExtended } from './ratio-capability';

// Registered features0-bit ids whose GameSettings field shares the id's name and is requested
// unconditionally (any extra condition, e.g. "only when the ratio is actually wide", is applied by the
// caller on top of effectiveFeatureIds, since the resolver only owns the requires/vanillaSafe cascade).
const RAW_FEATURE_KEYS = [
  'extendedRendering', 'linearWorldTilemap', 'ultrawideRendering', 'tallRendering',
  'widescreenSprites', 'widescreenVisualFixes', 'cameraLockToViewport', 'smoothTransitions',
  'pauseOffscreenAI', 'perGroupVolume', 'inventoryReorder', 'secondaryItemSlots', 'autoSkipDialog',
  'prefillFileName',
  // World-item presentation, and the archery host's refusal. Their bits live in features3
  // instead of features0, but the resolver only cares about ids, so they cascade and strip
  // like everything else here.
  'coloredRupees', 'itemSheen', 'archeryNeedsBow',
] as const satisfies readonly (keyof GameSettings)[];

/** Every registered feature id currently requested by raw settings, before the resolver prunes it. */
const requestedFeatureIds = (s: GameSettings): string[] => {
  const ids: string[] = RAW_FEATURE_KEYS.filter((key) => Boolean(s[key]));
  // Registered ids whose raw field is not a boolean of the same name: the three-way off-screen
  // mode requests its 'idle' bit, and the play-area toggle is optional on GameSettings. Without
  // these the resolver never sees either id, so neither features2 bit is ever sent.
  if (offscreenAiMode(s) === 'idle') ids.push('offscreenAI');
  if (s.widescreenPlayArea === true) ids.push('widescreenPlayArea');
  for (const fix of BUNDLE_FIXES) {
    // The widescreen corrections are one setting: the Display switch, on by default with extended
    // rendering, covers the core bit and every fix split from that bundle. No per-fix override.
    if (fix.bundleOrigin === 'WidescreenVisualFixes') {
      if (rendersExtended(s) && s.widescreenVisualFixes) ids.push(fix.id);
      continue;
    }
    // Matches the legacy-bundle fallback in buildFeatureWords: an unset granular toggle inherits the
    // bundle master it was split from.
    const legacy = fix.bundleOrigin === 'GameChangingBugFixes' ? s.gameChangingBugFixes : s.miscBugFixes;
    if (s.bugFixToggles?.[fix.id] ?? legacy) ids.push(fix.id);
  }
  return ids;
};

/** Registered feature ids that should actually apply right now: the requested set run through the
 * Vanilla Safe strip + requires-fixpoint (resolveGates). */
const effectiveFeatureIds = (s: GameSettings): Set<string> =>
  resolveGates(requestedFeatureIds(s), { vanillaSafe: s.vanillaSafe }).effective;

export { effectiveFeatureIds, requestedFeatureIds };
