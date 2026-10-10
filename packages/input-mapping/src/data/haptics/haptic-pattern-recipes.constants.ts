/* @layer shared-input @kind data */
import { COMBAT_PATTERNS } from './combat-patterns.constants';
import { ITEM_PATTERNS } from './item-patterns.constants';
import { ENVIRONMENT_PATTERNS } from './environment-patterns.constants';

const HAPTIC_PATTERN_RECIPES = {
  ...COMBAT_PATTERNS,
  ...ITEM_PATTERNS,
  ...ENVIRONMENT_PATTERNS,
};

export { HAPTIC_PATTERN_RECIPES };
