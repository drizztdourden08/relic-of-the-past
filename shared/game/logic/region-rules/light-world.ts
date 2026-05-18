import type { Requirement } from '../../types';
import {
  hasSword,
  canLiftRocks, canLiftHeavyRocks,
  canUseBombs, canBombOrBonk,
} from '../helpers';

/** Region entrance rules for Light World locations. */
export const LIGHT_WORLD_REGION_RULES: Record<string, Requirement> = {
  'Light World Bomb Hut': canUseBombs,
  'Kings Grave': 'Pegasus Boots',
  'Kings Grave Outer Rocks': canLiftHeavyRocks,
  'Kings Grave Inner Rocks': canLiftHeavyRocks,
  'Bonk Fairy (Light)': 'Pegasus Boots',
  'Lumberjack Tree Tree': { and: ['Pegasus Boots', 'Beat Agahnim 1'] },
  'Bonk Rock Cave': 'Pegasus Boots',
  'Desert Palace Stairs': 'Book of Mudora',
  'Sanctuary Grave': canLiftRocks,
  '20 Rupee Cave': canLiftRocks,
  '50 Rupee Cave': canLiftRocks,
  'Death Mountain Entrance Rock': canLiftRocks,
  'Flute Spot 1': 'Activated Flute',
  'Lake Hylia Central Island Teleporter': canLiftHeavyRocks,
  'Dark Desert Teleporter': { and: ['Activated Flute', canLiftHeavyRocks] },
  'East Hyrule Teleporter': { and: ['Hammer', canLiftRocks, 'Moon Pearl'] },
  'South Hyrule Teleporter': { and: ['Hammer', canLiftRocks, 'Moon Pearl'] },
  'Kakariko Teleporter': {
    and: [
      { or: [{ and: ['Hammer', canLiftRocks] }, canLiftHeavyRocks] },
      'Moon Pearl',
    ],
  },
  'Bat Cave Drop Ledge': 'Hammer',
  'Desert Palace Entrance (North) Rocks': canLiftRocks,
  'Desert Ledge Return Rocks': canLiftRocks,
  'Checkerboard Cave': canLiftRocks,
  'Two Brothers House Exit (West)': canBombOrBonk,
  'Two Brothers House Exit (East)': canBombOrBonk,
  'Light World Death Mountain Shop': canUseBombs,
  'Mini Moldorm Cave': canUseBombs,
  'Ice Rod Cave': canUseBombs,
  'Light Hype Fairy': canUseBombs,
  'Waterfall of Wishing': 'Flippers',

  // Death Mountain teleporters (LW → DW)
  'Death Mountain (Top) Teleporter': 'Moon Pearl',
  'East Death Mountain Teleporter': 'Moon Pearl',

  // Castle Tower entrance
  'Agahnims Tower': hasSword,

  'Paradox Cave Bomb Jump': canUseBombs,
};
