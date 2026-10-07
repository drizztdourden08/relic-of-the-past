/* @layer bridge-wasm @kind logic */
/**
 * The two extra bitmask words (features1/features2): the 42 split bug-fix toggles from the generated
 * registry, plus the hand-authored features2 bits. Every id goes through the Vanilla Safe resolver, so
 * a parity-affecting bit is dropped there before it is packed here.
 */
import type { GameSettings } from '@shared/types/settings';
import { BUNDLE_FIXES } from '@shared/features/bundle-fixes.generated';
import { effectiveFeatureIds } from './live-settings-gate';
import { offscreenAiMode } from './settings';

// Hand-authored features2 bits, allocated downward from bit 24; the generated bug-fix catalog
// (BUNDLE_FIXES) owns features2 upward from bit 0. Values must match features.h.
const FEATURES2_FLAGS = {
  widescreenPlayArea: 16777216, // kFeatures2_WidescreenPlayArea = 1 << 24
  widescreenIdleAI: 33554432, // kFeatures2_WidescreenIdleAI = 1 << 25
  titleOverride: 67108864, // kFeatures2_TitleOverride = 1 << 26
} as const;

// Each fix is on when its granular toggle is set, falling back to the legacy bundle setting it was
// extracted from so existing profiles keep their behavior. Values come from the generated registry
// (must match features_bugfixes.h).
const buildFeatureWords = (s: GameSettings): { features1: number; features2: number } => {
  const effective = effectiveFeatureIds(s);
  let f1 = 0;
  let f2 = 0;
  for (const fix of BUNDLE_FIXES) {
    if (!effective.has(fix.id) || !fix.bit) continue;
    if (fix.word === 2) f2 |= fix.bit;
    else f1 |= fix.bit;
  }
  // The wide-view condition stays separate because it depends on aspectRatio, not on another feature id.
  const wide = effective.has('extendedRendering') && s.aspectRatio !== '4:3';
  if (wide) {
    if (effective.has('widescreenPlayArea')) f2 |= FEATURES2_FLAGS.widescreenPlayArea;
    if (effective.has('offscreenAI') && offscreenAiMode(s) === 'idle') f2 |= FEATURES2_FLAGS.widescreenIdleAI;
  }
  // The title hide: registered, so Vanilla Safe strips it through the same resolver.
  if (effective.has('titleOverride')) f2 |= FEATURES2_FLAGS.titleOverride;
  return { features1: f1, features2: f2 };
};

export { buildFeatureWords, FEATURES2_FLAGS };
