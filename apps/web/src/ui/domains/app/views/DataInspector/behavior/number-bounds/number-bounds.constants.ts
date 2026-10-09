/* @layer renderer-app @kind constants */
import type { BoundsRule } from '../../DataInspector.type';
import { screenBounds } from './screen-bounds';

const BOUNDS_BY_COLLECTION: Record<string, BoundsRule> = {
  screen: screenBounds,
};

export { BOUNDS_BY_COLLECTION };
