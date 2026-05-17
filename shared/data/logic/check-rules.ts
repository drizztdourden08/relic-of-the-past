import type { Requirement } from '../../types/tracker';
import {
  hasSword, hasBeamSword, hasMeleeWeapon,
  canLiftRocks, canLiftHeavyRocks,
  canShootArrows, canUseBombs, canBombOrBonk,
  hasFireSource, canMeltThings, canRetrieveTablet,
  canActivateCrystalSwitch, canKillMostThings,
  hasCrystals,
} from './helpers';

/**
 * Per-check local access rules. Keys are check IDs matching the check
 * definition files. Values are the Requirement needed to access the check
 * WITHIN its region. Checks with no local rule are omitted.
 */
export const CHECK_RULES: Record<string, Requirement> = {
  // ── Light World Overworld ──────────────────────────────────────────
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

  // ── Dark World Overworld ───────────────────────────────────────────
  'Digging Game': 'Shovel',
  'Purple Chest': canLiftHeavyRocks,
  'Blacksmith': canLiftHeavyRocks,

  // ── Hyrule Castle / Sewers ─────────────────────────────────────────
  'Sewers - Dark Cross': 'Lamp',
  'Sewers - Key Rat Key Drop': 'Lamp',

  // ── Eastern Palace ─────────────────────────────────────────────────
  'Eastern Palace - Big Chest': 'Big Key (Eastern Palace)',
  'Eastern Palace - Big Key Chest': 'Lamp',
  'Eastern Palace - Dark Square Pot Key': 'Lamp',
  'Eastern Palace - Dark Eyegore Key Drop': 'Lamp',
  'Eastern Palace - Boss': { and: ['Big Key (Eastern Palace)', 'Lamp', canShootArrows] },
  'Eastern Palace - Prize': { and: ['Big Key (Eastern Palace)', 'Lamp', canShootArrows] },

  // ── Desert Palace ──────────────────────────────────────────────────
  'Desert Palace - Big Chest': 'Big Key (Desert Palace)',
  'Desert Palace - Torch': 'Pegasus Boots',
  'Desert Palace - Boss': canKillMostThings,
  'Desert Palace - Prize': canKillMostThings,

  // ── Tower of Hera ──────────────────────────────────────────────────
  'Tower of Hera - Big Key Chest': hasFireSource,
  'Tower of Hera - Big Chest': 'Big Key (Tower of Hera)',
  'Tower of Hera - Boss': canKillMostThings,
  'Tower of Hera - Prize': canKillMostThings,

  // ── Palace of Darkness ─────────────────────────────────────────────
  'Palace of Darkness - Arena Ledge': 'Pegasus Boots',
  'Palace of Darkness - Dark Basement - Left': 'Lamp',
  'Palace of Darkness - Dark Basement - Right': 'Lamp',
  'Palace of Darkness - Dark Maze - Top': 'Lamp',
  'Palace of Darkness - Dark Maze - Bottom': 'Lamp',
  'Palace of Darkness - Big Chest': { and: ['Big Key (Palace of Darkness)', 'Lamp'] },
  'Palace of Darkness - Boss': { and: ['Big Key (Palace of Darkness)', 'Lamp', 'Hammer', canShootArrows] },
  'Palace of Darkness - Prize': { and: ['Big Key (Palace of Darkness)', 'Lamp', 'Hammer', canShootArrows] },

  // ── Swamp Palace ───────────────────────────────────────────────────
  'Swamp Palace - Map Chest': canUseBombs,
  'Swamp Palace - Big Chest': { and: ['Big Key (Swamp Palace)', canUseBombs] },

  // ── Thieves' Town ──────────────────────────────────────────────────
  "Thieves' Town - Big Chest": 'Hammer',
  "Thieves' Town - Boss": canKillMostThings,
  "Thieves' Town - Prize": canKillMostThings,

  // ── Skull Woods ────────────────────────────────────────────────────
  'Skull Woods - Big Chest': { and: ['Big Key (Skull Woods)', canUseBombs] },
  'Skull Woods - Boss': { and: ['Fire Rod', hasSword] },
  'Skull Woods - Prize': { and: ['Fire Rod', hasSword] },

  // ── Ice Palace ─────────────────────────────────────────────────────
  'Ice Palace - Freezor Chest': canMeltThings,
  'Ice Palace - Big Chest': 'Big Key (Ice Palace)',
  'Ice Palace - Hammer Block Key Drop': { and: ['Hammer', canLiftRocks] },
  'Ice Palace - Boss': canMeltThings,
  'Ice Palace - Prize': canMeltThings,

  // ── Misery Mire ────────────────────────────────────────────────────
  'Misery Mire - Big Chest': 'Big Key (Misery Mire)',
  'Misery Mire - Compass Chest': hasFireSource,
  'Misery Mire - Big Key Chest': hasFireSource,

  // ── Turtle Rock ────────────────────────────────────────────────────
  'Turtle Rock - Chain Chomps': 'Small Key (Turtle Rock)',
  'Turtle Rock - Big Chest': 'Cane of Somaria',
  'Turtle Rock - Boss': { and: ['Fire Rod', 'Ice Rod'] },
  'Turtle Rock - Prize': { and: ['Fire Rod', 'Ice Rod'] },

  // ── Ganon's Tower ──────────────────────────────────────────────────
  "Ganons Tower - Bob's Torch": 'Pegasus Boots',
  'Ganons Tower - Compass Room - Top Left': 'Fire Rod',
  'Ganons Tower - Compass Room - Top Right': 'Fire Rod',
  'Ganons Tower - Compass Room - Bottom Left': 'Fire Rod',
  'Ganons Tower - Compass Room - Bottom Right': 'Fire Rod',
  'Ganons Tower - Randomizer Room - Top Left': { and: ['Hammer', 'Hookshot'] },
  'Ganons Tower - Randomizer Room - Top Right': { and: ['Hammer', 'Hookshot'] },
  'Ganons Tower - Randomizer Room - Bottom Left': { and: ['Hammer', 'Hookshot'] },
  'Ganons Tower - Randomizer Room - Bottom Right': { and: ['Hammer', 'Hookshot'] },
  'Ganons Tower - Big Chest': { and: ['Big Key (Ganons Tower)', canUseBombs, { or: ['Hookshot', 'Cane of Somaria'] }] },
  'Ganons Tower - Big Key Chest': { and: [canUseBombs, canActivateCrystalSwitch] },
  'Ganons Tower - Big Key Room - Left': { and: [canUseBombs, canActivateCrystalSwitch] },
  'Ganons Tower - Big Key Room - Right': { and: [canUseBombs, canActivateCrystalSwitch] },
  'Ganons Tower - Mini Helmasaur Room - Left': canShootArrows,
  'Ganons Tower - Mini Helmasaur Room - Right': canShootArrows,
  'Ganons Tower - Mini Helmasaur Key Drop': canShootArrows,

  // ── Ganon (final boss) ─────────────────────────────────────────────
  'Ganon': { and: [hasBeamSword, 'Lamp', 'Silver Arrows'] },
};
