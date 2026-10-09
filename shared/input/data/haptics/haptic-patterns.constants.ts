/* @layer shared-input @kind constants */
import { buildPatternEntry } from './build-pattern-entry';
import { HAPTIC_PATTERN_RECIPES } from './haptic-pattern-recipes.data';
import type { HapticPatternEntry, HapticPatternId, HapticPatternRecipe } from './haptic-pattern.type';

const HAPTIC_PATTERNS = Object.fromEntries(
  Object.entries(HAPTIC_PATTERN_RECIPES).map(([id, recipe]: [string, HapticPatternRecipe]) => [id, buildPatternEntry(recipe)]),
) as Record<HapticPatternId, HapticPatternEntry>;

export { HAPTIC_PATTERNS };
