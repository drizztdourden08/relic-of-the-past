import type { Requirement } from '../../types';
import { canLiftHeavyRocks } from '../helpers';

/** Check rules for Dark World overworld locations. */
const DARK_WORLD_CHECK_RULES: Record<string, Requirement> = {
  'Digging Game': 'Shovel',
  'Purple Chest': canLiftHeavyRocks,
  'Blacksmith': canLiftHeavyRocks,
};

export { DARK_WORLD_CHECK_RULES };
