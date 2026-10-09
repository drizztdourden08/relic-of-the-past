/* @layer shared-input @kind data */
import { COMBAT_PATTERNS } from './combat.data';
import { ITEM_PATTERNS } from './items.data';
import { ENVIRONMENT_PATTERNS } from './environment.data';

const HAPTIC_PATTERN_RECIPES = {
  ...COMBAT_PATTERNS,
  ...ITEM_PATTERNS,
  ...ENVIRONMENT_PATTERNS,
};

export { HAPTIC_PATTERN_RECIPES };
