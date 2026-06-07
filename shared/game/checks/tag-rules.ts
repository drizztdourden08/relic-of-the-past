/* @layer shared-game @kind data */
/** Tag definitions + classification rules (which screens/dungeons map to tags). */
import type { CheckTag, TagDefinition } from './tags-types';

const TAG_DEFINITIONS: TagDefinition[] = [
  // World
  { id: 'light_world', label: 'Light World', category: 'world' },
  { id: 'dark_world', label: 'Dark World', category: 'world' },
  // Location type
  { id: 'dungeon', label: 'Dungeon', category: 'location' },
  { id: 'cave', label: 'Cave', category: 'location' },
  { id: 'house', label: 'House', category: 'location' },
  { id: 'overworld', label: 'Overworld', category: 'location' },
  // Light World areas
  { id: 'kakariko', label: 'Kakariko', category: 'area' },
  { id: 'death_mountain', label: 'Death Mountain', category: 'area' },
  { id: 'lost_woods', label: 'Lost Woods', category: 'area' },
  { id: 'eastern_area', label: 'East Hyrule', category: 'area' },
  { id: 'southern_area', label: 'South Hyrule', category: 'area' },
  { id: 'lake_hylia', label: 'Lake Hylia', category: 'area' },
  { id: 'desert', label: 'Desert', category: 'area' },
  { id: 'hyrule_castle_area', label: 'Hyrule Castle Area', category: 'area' },
  // Dark World areas
  { id: 'dark_death_mountain', label: 'Dark Death Mountain', category: 'area' },
  { id: 'dark_east', label: 'Dark East', category: 'area' },
  { id: 'dark_south', label: 'Dark South', category: 'area' },
  { id: 'dark_west', label: 'Dark West', category: 'area' },
  { id: 'dark_north', label: 'Dark North', category: 'area' },
  { id: 'dark_mire_area', label: 'Mire Area', category: 'area' },
  // Content
  { id: 'key', label: 'Key', category: 'content' },
  { id: 'big_key', label: 'Big Key', category: 'content' },
  { id: 'map_compass', label: 'Map/Compass', category: 'content' },
  { id: 'boss_item', label: 'Boss Item', category: 'content' },
  { id: 'progression', label: 'Progression', category: 'content' },
  { id: 'junk', label: 'Junk', category: 'content' },
  // Dungeons
  { id: 'hyrule_castle', label: 'Hyrule Castle', category: 'dungeon' },
  { id: 'castle_tower', label: 'Castle Tower', category: 'dungeon' },
  { id: 'eastern_palace', label: 'Eastern Palace', category: 'dungeon' },
  { id: 'desert_palace', label: 'Desert Palace', category: 'dungeon' },
  { id: 'tower_of_hera', label: 'Tower of Hera', category: 'dungeon' },
  { id: 'palace_of_darkness', label: 'Palace of Darkness', category: 'dungeon' },
  { id: 'swamp_palace', label: 'Swamp Palace', category: 'dungeon' },
  { id: 'skull_woods', label: 'Skull Woods', category: 'dungeon' },
  { id: 'thieves_town', label: "Thieves' Town", category: 'dungeon' },
  { id: 'ice_palace', label: 'Ice Palace', category: 'dungeon' },
  { id: 'misery_mire', label: 'Misery Mire', category: 'dungeon' },
  { id: 'turtle_rock', label: 'Turtle Rock', category: 'dungeon' },
  { id: 'ganons_tower', label: "Ganon's Tower", category: 'dungeon' },
];

// ─── Dungeon name → tag ───
const DUNGEON_TAG_MAP: Record<string, CheckTag> = {
  'Hyrule Castle': 'hyrule_castle',
  'Castle Tower': 'castle_tower',
  'Eastern Palace': 'eastern_palace',
  'Desert Palace': 'desert_palace',
  'Tower of Hera': 'tower_of_hera',
  'Palace of Darkness': 'palace_of_darkness',
  'Swamp Palace': 'swamp_palace',
  'Skull Woods': 'skull_woods',
  "Thieves' Town": 'thieves_town',
  'Ice Palace': 'ice_palace',
  'Misery Mire': 'misery_mire',
  'Turtle Rock': 'turtle_rock',
  "Ganon's Tower": 'ganons_tower',
};

// ─── Light World dungeons ───
const LIGHT_WORLD_DUNGEONS = new Set([
  'Hyrule Castle', 'Castle Tower', 'Eastern Palace', 'Desert Palace', 'Tower of Hera',
]);

// ─── Cave screens (overworld checks in caves) ───
const CAVE_SCREENS = new Set([
  'Blinds Hideout', 'Kakariko Well (top)', 'Waterfall of Wishing', 'Kings Grave',
  'Aginahs Cave', 'Sahasrahlas Hut', 'Mini Moldorm Cave', 'Ice Rod Cave',
  'Bonk Rock Cave', 'Checkerboard Cave', 'Graveyard Cave', 'Cave 45',
  'Paradox Cave Chest Area', 'Spiral Cave (Top)', 'Mimic Cave', 'Spike Cave',
  'Spectacle Rock Cave (Top)', 'Hype Cave', 'Mire Shed', 'Superbunny Cave (Top)',
  'Hookshot Cave', 'Dark World Hammer Peg Cave', 'Bat Cave (right)',
  'Old Man Cave', 'Lost Woods Hideout (top)', 'Lumberjack Tree (top)',
]);

// ─── House screens ───
const HOUSE_SCREENS = new Set([
  'Links House', 'Tavern', 'Chicken House', 'Library', 'Sick Kids House',
  'Blacksmiths Hut', 'Brewery', 'C-Shaped House', 'Chest Game',
  'Pyramid Fairy', 'Potion Shop',
]);

// ─── Area classification for overworld checks ───
const AREA_RULES: Array<{ pattern: RegExp | Set<string>; tag: CheckTag }> = [
  // Death Mountain (Light)
  { pattern: new Set(['Old Man Cave', 'Spectacle Rock Cave (Top)', 'Paradox Cave Chest Area',
    'Spiral Cave (Top)', 'Mimic Cave', 'Spike Cave', 'Death Mountain (Top)',
    'Spectacle Rock', 'Death Mountain Floating Island (Light World)']), tag: 'death_mountain' },
  { pattern: /Ether Tablet|Spectacle Rock|Floating Island|Old Man|Paradox|Spiral/, tag: 'death_mountain' },
  // Kakariko
  { pattern: new Set(['Blinds Hideout', 'Kakariko Well (top)', 'Tavern', 'Chicken House',
    'Library', 'Sick Kids House', 'Blacksmiths Hut', 'Maze Race Ledge']), tag: 'kakariko' },
  { pattern: /Kakariko|Blind|Tavern|Chicken|Library|Sick Kid|Blacksmith|Maze Race/, tag: 'kakariko' },
  // Lost Woods
  { pattern: /Lost Woods|Lumberjack|Master Sword Meadow|Mushroom/, tag: 'lost_woods' },
  // Eastern
  { pattern: new Set(['Sahasrahlas Hut', 'Zoras River', 'Waterfall of Wishing',
    'Kings Grave', 'Potion Shop']), tag: 'eastern_area' },
  { pattern: /Sahasrahla|Zora|Waterfall|King.*Grave|Potion/, tag: 'eastern_area' },
  // Southern
  { pattern: new Set(['Links House', 'Mini Moldorm Cave', 'Ice Rod Cave',
    'Bonk Rock Cave', 'Dam', 'Lake Hylia Island', 'Hobo Bridge']), tag: 'southern_area' },
  { pattern: /Mini Moldorm|Ice Rod|Bonk Rock|Dam|Floodgate|Hobo|Link.*House/, tag: 'southern_area' },
  // Lake Hylia
  { pattern: /Lake Hylia/, tag: 'lake_hylia' },
  // Desert
  { pattern: new Set(['Desert Ledge', 'Aginahs Cave', 'Checkerboard Cave', 'Cave 45',
    'Bombos Tablet Ledge']), tag: 'desert' },
  { pattern: /Desert|Aginah|Checkerboard|Cave 45|Bombos Tablet/, tag: 'desert' },
  // Hyrule Castle
  { pattern: /Hyrule Castle Secret|Sanctuary/, tag: 'hyrule_castle_area' },
  // Dark World areas
  { pattern: /East Dark World|Catfish|Pyramid/, tag: 'dark_east' },
  { pattern: /South Dark World|Hype Cave|Digging/, tag: 'dark_south' },
  { pattern: /West Dark World|Hammer Peg|Brewery|C-Shaped|Chest Game|Bumper/, tag: 'dark_west' },
  { pattern: /Superbunny|Hookshot Cave|Dark Death Mountain/, tag: 'dark_death_mountain' },
  { pattern: /Mire Shed/, tag: 'dark_mire_area' },
];

export { TAG_DEFINITIONS, DUNGEON_TAG_MAP, LIGHT_WORLD_DUNGEONS, CAVE_SCREENS, HOUSE_SCREENS, AREA_RULES };
