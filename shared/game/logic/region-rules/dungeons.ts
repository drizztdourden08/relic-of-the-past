import type { Requirement } from '../../types';
import {
  hasSword, hasBeamSword, hasMeleeWeapon,
  canLiftRocks,
  canShootArrows, canUseBombs, canBombOrBonk,
  hasFireSource, canMeltThings,
  canActivateCrystalSwitch, canKillMostThings,
} from '../helpers';

/** Region entrance rules for dungeon-internal progression. */
const DUNGEON_REGION_RULES: Record<string, Requirement> = {
  // Hyrule Castle / Sewers
  'Sewers Door': 'Small Key (Hyrule Castle)',
  'Sewers Back Door': 'Small Key (Hyrule Castle)',
  'Sewers Secret Room': canBombOrBonk,

  // Agahnims Tower
  'Agahnim 1': { and: [hasSword, 'Small Key (Agahnims Tower)'] },

  // Tower of Hera
  'Tower of Hera Small Key Door': {
    and: [canActivateCrystalSwitch, 'Small Key (Tower of Hera)'],
  },
  'Tower of Hera Big Key Door': {
    and: [
      canActivateCrystalSwitch,
      'Big Key (Tower of Hera)',
      {
        or: [
          hasMeleeWeapon,
          { and: ['Silver Bow', canShootArrows] },
          'Cane of Byrna',
          'Cane of Somaria',
        ],
      },
    ],
  },

  // Desert Palace
  'Desert Palace East Wing': 'Small Key (Desert Palace)',

  // Swamp Palace
  'Swamp Palace Moat': { and: ['Flippers', 'Open Floodgate'] },
  'Swamp Palace Small Key Door': 'Small Key (Swamp Palace)',
  'Swamp Palace (Center)': { and: ['Hammer', 'Small Key (Swamp Palace)'] },
  'Swamp Palace (North)': { and: ['Hookshot', 'Small Key (Swamp Palace)'] },
  'Swamp Palace (West)': 'Small Key (Swamp Palace)',

  // Thieves Town
  'Thieves Town Big Key Door': 'Big Key (Thieves Town)',
  'Blind Fight': { and: ['Small Key (Thieves Town)', canUseBombs] },

  // Skull Woods
  'Skull Woods First Section South Door': 'Small Key (Skull Woods)',
  'Skull Woods First Section (Right) North Door': 'Small Key (Skull Woods)',
  'Skull Woods First Section West Door': 'Small Key (Skull Woods)',
  'Skull Woods First Section (Left) Door to Exit': 'Small Key (Skull Woods)',
  'Skull Woods Torch Room': {
    and: ['Small Key (Skull Woods)', 'Fire Rod', hasSword],
  },

  // Ice Palace
  'Ice Palace (Second Section)': {
    and: [canMeltThings, 'Small Key (Ice Palace)', canUseBombs],
  },
  'Ice Palace (Main)': 'Small Key (Ice Palace)',
  'Ice Palace (East)': { or: ['Hookshot', 'Small Key (Ice Palace)'] },
  'Ice Palace (Kholdstare)': {
    and: [canLiftRocks, 'Hammer', 'Big Key (Ice Palace)'],
  },

  // Misery Mire
  'Misery Mire Entrance Gap': 'Cane of Somaria',
  'Misery Mire Entrance Gap Reverse': 'Cane of Somaria',
  'Misery Mire (West)': 'Small Key (Misery Mire)',
  'Misery Mire Big Key Door': 'Big Key (Misery Mire)',
  'Misery Mire (Vitreous)': { and: ['Cane of Somaria', canUseBombs] },

  // Turtle Rock
  'Turtle Rock Entrance Gap': 'Cane of Somaria',
  'Turtle Rock Entrance Gap Reverse': 'Cane of Somaria',
  'Turtle Rock Dark Room Staircase': 'Small Key (Turtle Rock)',
  'Turtle Rock (Trinexx)': {
    and: ['Small Key (Turtle Rock)', 'Big Key (Turtle Rock)', 'Cane of Somaria'],
  },
  'Turtle Rock (Dark Room) (North)': 'Cane of Somaria',
  'Turtle Rock (Dark Room) (South)': 'Cane of Somaria',
  'Turtle Rock Second Section Bomb Wall': canKillMostThings,

  // Palace of Darkness
  'Palace of Darkness Big Key Door': 'Big Key (Palace of Darkness)',
  'Palace of Darkness Spike Statue Room Door': 'Small Key (Palace of Darkness)',
  'Palace of Darkness Maze Door': 'Small Key (Palace of Darkness)',

  // Ganons Tower
  'Ganons Tower (Tile Room)': 'Cane of Somaria',
  'Ganons Tower (Hookshot Room)': {
    and: ['Hammer', { or: ['Hookshot', 'Pegasus Boots'] }],
  },
  'Ganons Tower Big Key Door': 'Big Key (Ganons Tower)',
  'Ganons Tower (Tile Room) Key Door': {
    and: ['Fire Rod', 'Small Key (Ganons Tower)'],
  },
  'Ganons Tower (Map Room)': 'Small Key (Ganons Tower)',
  'Ganons Tower (Double Switch Room)': { or: ['Cane of Somaria', canUseBombs] },
  'Ganons Tower Torch Rooms': { and: [canKillMostThings, hasFireSource] },
  'Ganons Tower Moldorm Door': {
    and: ['Small Key (Ganons Tower)', canUseBombs],
  },
  'Ganons Tower Moldorm Gap': 'Hookshot',
  'Ganon Drop': hasBeamSword,
};

export { DUNGEON_REGION_RULES };
