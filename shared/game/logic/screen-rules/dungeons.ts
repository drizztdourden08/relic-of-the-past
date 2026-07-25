/* @layer shared-game @kind data */
import type { Requirement } from '../../types';
import {
  hasSword, hasBeamSword, hasMeleeWeapon,
  canLiftRocks,
  canShootArrows, canUseBombs, canBombOrBonk,
  hasFireSource, canMeltThings,
  canActivateCrystalSwitch, canKillMostThings,
} from '../helpers';

/**
 * Screen connection rules for dungeon-internal progression (keyed by from|to).
 *
 * NOTE: These rules are currently inactive — the dungeon connection data does
 * not yet use matching from|to keys. They will activate once dungeon connections
 * are restructured to match these keys.
 */
const DUNGEON_SCREEN_RULES: Record<string, Requirement> = {
  // First castle / sewers
  'hc-0x01|hc-sewers': 'Small Key (Hyrule Castle)',
  'hc-0x11|hc-sewers-back': 'Small Key (Hyrule Castle)',
  'hc-sewers|hc-secret-room': canBombOrBonk,

  // Wizards tower
  'ct-0x20|ct-agahnim': { and: [hasSword, 'Small Key (Agahnims Tower)'] },

  // Tower of Hera
  'toh-entrance|toh-key-door': {
    and: [canActivateCrystalSwitch, 'Small Key (Tower of Hera)'],
  },
  'toh-key-door|toh-big-key-door': {
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
  'dp-main|dp-east-wing': 'Small Key (Desert Palace)',

  // Swamp Palace
  'sp-entrance|sp-moat': { and: ['Flippers', 'Open Floodgate'] },
  'sp-moat|sp-key-door': 'Small Key (Swamp Palace)',
  'sp-key-door|sp-center': { and: ['Hammer', 'Small Key (Swamp Palace)'] },
  'sp-center|sp-north': { and: ['Hookshot', 'Small Key (Swamp Palace)'] },
  'sp-center|sp-west': 'Small Key (Swamp Palace)',

  // Thieves Town
  'tt-entrance|tt-big-key-door': 'Big Key (Thieves Town)',
  'tt-big-key-door|tt-blind': { and: ['Small Key (Thieves Town)', canUseBombs] },

  // Skull Woods
  'sw-first|sw-south-door': 'Small Key (Skull Woods)',
  'sw-first-right|sw-north-door': 'Small Key (Skull Woods)',
  'sw-first|sw-west-door': 'Small Key (Skull Woods)',
  'sw-first-left|sw-exit-door': 'Small Key (Skull Woods)',
  'sw-exit|sw-torch-room': {
    and: ['Small Key (Skull Woods)', 'Fire Rod', hasSword],
  },

  // Ice Palace
  'ip-entrance|ip-second': {
    and: [canMeltThings, 'Small Key (Ice Palace)', canUseBombs],
  },
  'ip-second|ip-main': 'Small Key (Ice Palace)',
  'ip-main|ip-east': { or: ['Hookshot', 'Small Key (Ice Palace)'] },
  'ip-main|ip-kholdstare': {
    and: [canLiftRocks, 'Hammer', 'Big Key (Ice Palace)'],
  },

  // Misery Mire
  'mm-entrance|mm-gap': 'Cane of Somaria',
  'mm-gap|mm-entrance': 'Cane of Somaria',
  'mm-gap|mm-west': 'Small Key (Misery Mire)',
  'mm-west|mm-big-key-door': 'Big Key (Misery Mire)',
  'mm-big-key-door|mm-vitreous': { and: ['Cane of Somaria', canUseBombs] },

  // Turtle Rock
  'tr-entrance|tr-gap': 'Cane of Somaria',
  'tr-gap|tr-entrance': 'Cane of Somaria',
  'tr-gap|tr-dark-room-staircase': 'Small Key (Turtle Rock)',
  'tr-dark-room|tr-trinexx': {
    and: ['Small Key (Turtle Rock)', 'Big Key (Turtle Rock)', 'Cane of Somaria'],
  },
  'tr-dark-room|tr-north': 'Cane of Somaria',
  'tr-north|tr-dark-room': 'Cane of Somaria',
  'tr-dark-room|tr-bomb-wall': canKillMostThings,

  // Palace of Darkness
  'pod-entrance|pod-big-key-door': 'Big Key (Palace of Darkness)',
  'pod-entrance|pod-spike-statue': 'Small Key (Palace of Darkness)',
  'pod-spike-statue|pod-maze': 'Small Key (Palace of Darkness)',

  // Final tower
  'gt-entrance|gt-tile-room': 'Cane of Somaria',
  'gt-entrance|gt-hookshot-room': {
    and: ['Hammer', { or: ['Hookshot', 'Pegasus Boots'] }],
  },
  'gt-main|gt-big-key-door': 'Big Key (Ganons Tower)',
  'gt-tile-room|gt-key-door': {
    and: ['Fire Rod', 'Small Key (Ganons Tower)'],
  },
  'gt-main|gt-map-room': 'Small Key (Ganons Tower)',
  'gt-main|gt-double-switch': { or: ['Cane of Somaria', canUseBombs] },
  'gt-main|gt-torch-rooms': { and: [canKillMostThings, hasFireSource] },
  'gt-torch-rooms|gt-moldorm-door': {
    and: ['Small Key (Ganons Tower)', canUseBombs],
  },
  'gt-moldorm|gt-moldorm-gap': 'Hookshot',
  'gt-moldorm-gap|gt-ganon-drop': hasBeamSword,
};

export { DUNGEON_SCREEN_RULES };
