import type { Requirement } from '../../types';
import {
  hasSword,
  canLiftRocks, canLiftHeavyRocks,
  canUseBombs, canBombOrBonk,
} from '../helpers';

/** Screen connection rules for Light World (keyed by from|to). */
const LIGHT_WORLD_SCREEN_RULES: Record<string, Requirement> = {
  'lw-18|light-world-bomb-hut': canUseBombs,
  'kings-grave-area|kings-grave': 'Pegasus Boots',
  'lw-14|bonk-fairy-light': 'Pegasus Boots',
  'lw-02|lumberjack-tree-top': { and: ['Pegasus Boots', 'Beat Agahnim 1'] },
  'lw-22|bonk-rock-cave': 'Pegasus Boots',
  'lw-38|desert-palace-stairs': 'Book of Mudora',
  // lw-14|kings-grave-area: OR of Sanctuary Grave (canLiftRocks) + Kings Grave Outer Rocks (Titans Mitts)
  'lw-14|kings-grave-area': canLiftRocks,
  'lw-33|20-rupee-cave': canLiftRocks,
  'lw-34|50-rupee-cave': canLiftRocks,
  'lw-0a|death-mountain-entrance': canLiftRocks,
  'light-world|death-mountain-entrance': 'Activated Flute',
  'lake-hylia-central-island|lw-35': canLiftHeavyRocks,
  'lw-30|dark-desert': { and: ['Activated Flute', canLiftHeavyRocks] },
  'lw-1e|east-dark-world': { and: ['Hammer', canLiftRocks, 'Moon Pearl'] },
  'lw-3c|south-dark-world': { and: ['Hammer', canLiftRocks, 'Moon Pearl'] },
  'lw-10|west-dark-world': {
    and: [
      { or: [{ and: ['Hammer', canLiftRocks] }, canLiftHeavyRocks] },
      'Moon Pearl',
    ],
  },
  'desert-northern-cliffs|checkerboard-cave': canLiftRocks,
  'two-brothers-house|maze-race-ledge': canBombOrBonk,
  'lw-28|two-brothers-house': canBombOrBonk,
  'death-mountain|light-world-death-mountain-shop': canUseBombs,
  'lw-35|mini-moldorm-cave': canUseBombs,
  'lw-34|ice-rod-cave': canUseBombs,
  'lw-3c|swamp-healer-fairy': canUseBombs,
  'lw-0f|waterfall-of-wishing': 'Flippers',

  // Death Mountain teleporters (LW → DW)
  'death-mountain-top|dark-death-mountain-top': 'Moon Pearl',
  'east-death-mountain-top|dark-death-mountain-east-bottom': 'Moon Pearl',
};

export { LIGHT_WORLD_SCREEN_RULES };
