/* @layer shared-input @kind logic */
import { buildSegments } from './build-segments';
import type { HapticPatternEntry, HapticPatternRecipe } from './haptic-pattern.type';

const buildPatternEntry = (recipe: HapticPatternRecipe): HapticPatternEntry => {
  const { shape, ...timing } = recipe;
  return { segments: buildSegments(shape), ...timing };
};

export { buildPatternEntry };
