/* @layer shared-game @kind logic */
/**
 * The reference randomizer's region and cave names, turned into this dataset's screens. Most
 * names are the dataset's own; the rest are aliases here. A dungeon region name lands on one
 * room of that dungeon, since a dungeon is one place in the tracker's graph. The menu is the
 * graph's virtual root and has no screen.
 */
import { find } from '@shared/game/data';
import type { ScreenId } from '@shared/game/data/types';

/** Reference name -> dataset screen name, where they differ. */
const ALIASES: Readonly<Record<string, string>> = {
  'Links House': 'Starting House',
  'Aginahs Cave': "Aginah's Cave",
  'Sahasrahlas Hut': "Sahasrahla's Hut",
  'Kings Grave': "King's Tomb",
  'Kings Grave Area': "King's Grave Area",
  'Desert Ledge (Northeast)': 'Desert Ledge (NE)',
  'Desert Palace Entrance (North) Spot': 'Desert Palace North Spot',
  'Death Mountain (Top)': 'Death Mountain Top',
  'Death Mountain Floating Island (Light World)': 'Floating Island (LW)',
  'Death Mountain Floating Island (Dark World)': 'Floating Island (DW)',
  'Dark Death Mountain (West Bottom)': 'Dark Death Mountain West (Bottom)',
  'Dark Death Mountain (East Bottom)': 'Dark Death Mountain East (Bottom)',
  'Dark Death Mountain (Top)': 'Dark Death Mountain Top',
  'Dark Lake Hylia Shop': 'Cave Shop (Dark Lake Hylia)',
  'Master Sword Meadow': 'Pedestal Meadow',
  'Zoras River': 'Northern River',
  'Hobo Bridge': 'Eastern Ruins Bridge',
  'Turtle Rock (Top)': 'Turtle Rock',
  // Dungeon regions: one room each, the door the region is entered by.
  'Hyrule Castle': 'Main Entrance',
  'Sewer Drop': 'Sewers Drop',
  'Agahnims Tower': 'Entrance Hall',
  'Eastern Palace': 'Entrance Hall',
  'Desert Palace Main (Inner)': 'Main Entrance',
  'Desert Palace Main (Outer)': 'West Entrance',
  'Desert Palace North': 'East Entrance',
  'Tower of Hera (Bottom)': 'Entrance Hall',
  'Palace of Darkness (Entrance)': 'Entrance Hall',
  'Swamp Palace (Entrance)': 'Entrance Hall',
  'Skull Woods First Section': 'Entrance Hall',
  'Skull Woods First Section (Right)': 'Pot Prison',
  'Skull Woods First Section (Left)': 'Big Key Room',
  'Skull Woods First Section (Top)': 'Map Room',
  'Skull Woods Second Section': 'Big Chest Room',
  'Skull Woods Second Section (Drop)': 'Big Chest Room',
  'Skull Woods Final Section (Entrance)': 'Entrance Hall',
  'Thieves Town (Entrance)': 'Compass Room',
  'Ice Palace (Entrance)': 'Entrance Hall',
  'Misery Mire (Entrance)': 'Entrance Hall',
  'Turtle Rock (Entrance)': 'Main Entrance',
  'Turtle Rock (Second Section)': 'Entrance Hub',
  'Turtle Rock (Second Section Bomb Wall)': 'Entrance Hub',
  'Turtle Rock (Big Chest)': 'East Entrance',
  'Turtle Rock (Eye Bridge)': 'West Entrance',
  'Turtle Rock (Eye Bridge Bomb Wall)': 'West Entrance',
  'Ganons Tower (Entrance)': 'Entrance Hall',
};

/** Dungeon region names share room names across dungeons, so each is pinned to its dungeon. */
const DUNGEON_OF: Readonly<Record<string, string>> = {
  'Hyrule Castle': 'dungeon-001', 'Sewer Drop': 'dungeon-001', 'Sanctuary': 'dungeon-001',
  'Agahnims Tower': 'dungeon-002', 'Eastern Palace': 'dungeon-003',
  'Desert Palace Main (Inner)': 'dungeon-004', 'Desert Palace Main (Outer)': 'dungeon-004', 'Desert Palace North': 'dungeon-004',
  'Tower of Hera (Bottom)': 'dungeon-005', 'Palace of Darkness (Entrance)': 'dungeon-006', 'Swamp Palace (Entrance)': 'dungeon-007',
  'Skull Woods First Section': 'dungeon-008', 'Skull Woods First Section (Right)': 'dungeon-008', 'Skull Woods First Section (Left)': 'dungeon-008',
  'Skull Woods First Section (Top)': 'dungeon-008', 'Skull Woods Second Section': 'dungeon-008', 'Skull Woods Second Section (Drop)': 'dungeon-008',
  'Skull Woods Final Section (Entrance)': 'dungeon-008', 'Thieves Town (Entrance)': 'dungeon-009', 'Ice Palace (Entrance)': 'dungeon-010',
  'Misery Mire (Entrance)': 'dungeon-011', 'Turtle Rock (Entrance)': 'dungeon-012', 'Turtle Rock (Second Section)': 'dungeon-012',
  'Turtle Rock (Second Section Bomb Wall)': 'dungeon-012', 'Turtle Rock (Big Chest)': 'dungeon-012', 'Turtle Rock (Eye Bridge)': 'dungeon-012',
  'Turtle Rock (Eye Bridge Bomb Wall)': 'dungeon-012', 'Ganons Tower (Entrance)': 'dungeon-013',
};

const cache = new Map<string, ScreenId | null>();

/** The dataset screen a reference name stands for, or null when no screen carries that name. */
const screenOfName = (name: string): ScreenId | null => {
  const hit = cache.get(name);
  if (hit !== undefined) return hit;
  const wanted = ALIASES[name] ?? name;
  const dungeonId = DUNGEON_OF[name];
  const screen = dungeonId === undefined
    ? find('screen', (s) => s.randomizerName === wanted && s.kind !== 'dungeon')[0] ?? find('screen', (s) => s.randomizerName === wanted)[0]
    : find('screen', (s) => s.randomizerName === wanted && find('dungeon', (d) => d.id === dungeonId)[0]?.roomScreenIds.includes(s.id))[0];
  const id = screen?.id ?? null;
  cache.set(name, id);
  return id;
};

export { screenOfName };
