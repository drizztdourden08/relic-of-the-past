import type { Requirement } from '../../types/tracker';
import {
  hasSword, hasBeamSword, hasMeleeWeapon,
  canLiftRocks, canLiftHeavyRocks,
  canShootArrows, canUseBombs, canBombOrBonk,
  hasFireSource, canMeltThings,
  canActivateCrystalSwitch, canKillMostThings,
  hasMiseryMireMedallion, hasTurtleRockMedallion,
  hasCrystals,
} from './helpers';

/**
 * Access rules for region connections (entrances) in ALttP.
 *
 * Keys are entrance names matching those used in RegionConnection data.
 * Values are the Requirement needed to traverse that entrance.
 * Entrances with no rule (always accessible) are omitted.
 *
 * Based on Archipelago's non-inverted, no-glitches, open-mode rules.
 */
export const REGION_RULES: Record<string, Requirement> = {
  // ─── Overworld ───

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
  'Bumper Cave Entrance Mirror Spot': 'Magic Mirror',
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
  'Dark Lake Hylia Drop (East)': {
    or: [{ and: ['Moon Pearl', 'Flippers'] }, 'Magic Mirror'],
  },
  'Dark Lake Hylia Drop (South)': { and: ['Moon Pearl', 'Flippers'] },
  'Dark Lake Hylia Ledge Fairy': { and: ['Moon Pearl', canUseBombs] },
  'Dark Lake Hylia Ledge Spike Cave': canLiftRocks,
  'Thieves Town': 'Moon Pearl',
  'Skull Woods First Section Hole (North)': 'Moon Pearl',
  'Skull Woods Second Section Hole': 'Moon Pearl',
  'Maze Race Mirror Spot': 'Magic Mirror',
  'Cave 45 Mirror Spot': 'Magic Mirror',
  'Bombos Tablet Mirror Spot': 'Magic Mirror',
  'Kings Grave Mirror Spot': { and: ['Moon Pearl', 'Magic Mirror'] },
  'Graveyard Ledge Mirror Spot': { and: ['Moon Pearl', 'Magic Mirror'] },
  'Hyrule Castle Ledge Mirror Spot': 'Magic Mirror',
  'East Dark World Bridge': 'Hammer',
  'West Dark World Gap': 'Hookshot',
  'Village of Outcasts Heavy Rock': canLiftHeavyRocks,
  'Village of Outcasts Eastern Rocks': canLiftHeavyRocks,
  'Village of Outcasts Pegs': { and: ['Moon Pearl', 'Hammer'] },
  'Grassy Lawn Pegs': { and: ['Moon Pearl', 'Hammer'] },
  'Peg Area Rocks': { and: ['Moon Pearl', canLiftHeavyRocks] },
  'Bumper Cave Entrance Rock': canLiftRocks,
  'Bumper Cave Exit (Top)': 'Cape',
  'Bumper Cave Exit (Bottom)': { or: ['Cape', 'Hookshot'] },
  'Hookshot Cave': canLiftRocks,
  'Skull Woods Final Section': 'Fire Rod',
  'Misery Mire': { and: [hasSword, hasMiseryMireMedallion] },
  'Turtle Rock': { and: [hasSword, hasTurtleRockMedallion, 'Moon Pearl'] },
  'Hype Cave': canUseBombs,
  'Brewery': canUseBombs,
  'East Dark World River Pier': 'Flippers',
  'Dark Lake Hylia Teleporter': 'Flippers',
  'Catfish Entrance Rock': canLiftRocks,
  'Pyramid Hole': 'Beat Agahnim 2',
  'Ganons Tower': hasCrystals(7),
  'East Death Mountain (Top) Mirror Spot': 'Magic Mirror',
  'Lake Hylia Island Mirror Spot': 'Magic Mirror',
  'Spectacle Rock Mirror Spot': 'Magic Mirror',
  'Desert Ledge Mirror Spot': 'Magic Mirror',
  'Desert Palace Stairs Mirror Spot': 'Magic Mirror',
  'Desert Palace Entrance (North) Mirror Spot': 'Magic Mirror',
  'Floating Island Mirror Spot': 'Magic Mirror',
  'Paradox Cave Bomb Jump': canUseBombs,
  'Skull Woods First Section Bomb Jump': canUseBombs,

  // ─── Dungeon Internal ───

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
