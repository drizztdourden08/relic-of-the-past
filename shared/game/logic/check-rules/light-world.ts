import type { Requirement } from '../../types';
import {
  canRetrieveTablet, canLiftHeavyRocks,
} from '../helpers';

/** Check rules for Light World overworld locations. */
const LIGHT_WORLD_CHECK_RULES: Record<string, Requirement> = {
  'Ether Tablet': canRetrieveTablet,
  'Bombos Tablet': canRetrieveTablet,
  'Old Man': 'Lamp',
  'Spectacle Rock': 'Magic Mirror',
  'Sahasrahla': 'Green Pendant',
  'Master Sword Pedestal': { count: ['Pendants', 3] },
  'Hobo': 'Flippers',
  'Sick Kid': { count: ['Bottles', 1] },
  'Library': 'Pegasus Boots',
  'Magic Bat': 'Magic Powder',
  'Potion Shop': 'Mushroom',
  'Sunken Treasure': 'Open Floodgate',
  'Flute Spot': 'Shovel',
  'Flute Activation Spot': 'Flute',
  'Missing Smith': canLiftHeavyRocks,
  "Zora's Ledge": 'Flippers',
};

export { LIGHT_WORLD_CHECK_RULES };
