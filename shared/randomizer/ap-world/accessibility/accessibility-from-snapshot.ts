/* @layer shared-game @kind logic */
/**
 * Snapshot → accessibility mode, the one reading the generator and the live
 * panel share. A missing key (every profile frozen before the row was read)
 * or an unknown spelling reads as `full`, which is this app's baseline and
 * exactly the contract every stored placement was generated under — so a
 * legacy snapshot keeps its meaning.
 *
 * Note the reference's own default is `items`; this app's catalog baseline is
 * `full`, and that is what the fallback follows.
 */
import type { AccessibilityMode } from './accessibility.type';
import type { RandomizerOptionsSnapshot } from '../options.type';

const ACCESSIBILITY_KEY = 'accessibility';

const DEFAULT_ACCESSIBILITY: AccessibilityMode = 'full';

const KNOWN: ReadonlySet<string> = new Set<AccessibilityMode>(['full', 'items', 'minimal']);

const accessibilityFromSnapshot = (snapshot: RandomizerOptionsSnapshot): AccessibilityMode => {
  const raw = snapshot.values[ACCESSIBILITY_KEY];
  return typeof raw === 'string' && KNOWN.has(raw) ? raw as AccessibilityMode : DEFAULT_ACCESSIBILITY;
};

export { ACCESSIBILITY_KEY, DEFAULT_ACCESSIBILITY, accessibilityFromSnapshot };
