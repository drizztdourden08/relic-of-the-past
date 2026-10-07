/* @layer shared-input @kind data */
/**
 * Merges the per-category chunks into the single HAPTIC_PATTERNS map.
 * The global "intensity" slider scales all values.
 */

import { COMBAT_PATTERNS } from './combat.data';
import { ITEM_PATTERNS } from './items.data';
import { ENVIRONMENT_PATTERNS } from './environment.data';
import type { HapticPatternEntry } from './types';

const HAPTIC_PATTERNS = {
  ...COMBAT_PATTERNS,
  ...ITEM_PATTERNS,
  ...ENVIRONMENT_PATTERNS,
} as const;

type HapticPatternId = keyof typeof HAPTIC_PATTERNS;

export { HAPTIC_PATTERNS };
export type { HapticPatternEntry, HapticPatternId };
