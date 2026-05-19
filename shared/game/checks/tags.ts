/**
 * Tag system for checks — enables filtering, searching, and grouping.
 *
 * Tags are assigned via rules (by type, region patterns, dungeon, etc.)
 * rather than manually on each check. This keeps the check data clean
 * and makes it easy to adjust tagging logic.
 */

// ─── Tag definitions ───

/** All possible tags a check can have */
type CheckTag =
  // World
  | 'light_world'
  | 'dark_world'
  // Location type
  | 'dungeon'
  | 'cave'
  | 'house'
  | 'overworld'
  // Geographic area (Light World)
  | 'kakariko'
  | 'death_mountain'
  | 'lost_woods'
  | 'eastern_area'
  | 'southern_area'
  | 'lake_hylia'
  | 'desert'
  | 'hyrule_castle_area'
  // Geographic area (Dark World)
  | 'dark_death_mountain'
  | 'dark_east'
  | 'dark_south'
  | 'dark_west'
  | 'dark_north'
  | 'dark_mire_area'
  // Check content type
  | 'key'
  | 'big_key'
  | 'map_compass'
  | 'boss_item'
  | 'progression'
  | 'junk'
  // Dungeon-specific (for grouping within dungeons)
  | 'hyrule_castle'
  | 'castle_tower'
  | 'eastern_palace'
  | 'desert_palace'
  | 'tower_of_hera'
  | 'palace_of_darkness'
  | 'swamp_palace'
  | 'skull_woods'
  | 'thieves_town'
  | 'ice_palace'
  | 'misery_mire'
  | 'turtle_rock'
  | 'ganons_tower';

interface TagDefinition {
  id: CheckTag;
  label: string;
  category: 'world' | 'location' | 'area' | 'content' | 'dungeon';
}

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

// ─── Cave regions (overworld checks in caves) ───
const CAVE_REGIONS = new Set([
  'Blinds Hideout', 'Kakariko Well (top)', 'Waterfall of Wishing', 'Kings Grave',
  'Aginahs Cave', 'Sahasrahlas Hut', 'Mini Moldorm Cave', 'Ice Rod Cave',
  'Bonk Rock Cave', 'Checkerboard Cave', 'Graveyard Cave', 'Cave 45',
  'Paradox Cave Chest Area', 'Spiral Cave (Top)', 'Mimic Cave', 'Spike Cave',
  'Spectacle Rock Cave (Top)', 'Hype Cave', 'Mire Shed', 'Superbunny Cave (Top)',
  'Hookshot Cave', 'Dark World Hammer Peg Cave', 'Bat Cave (right)',
  'Old Man Cave', 'Lost Woods Hideout (top)', 'Lumberjack Tree (top)',
]);

// ─── House regions ───
const HOUSE_REGIONS = new Set([
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

// ─── Compute tags for a check ───

import type { CheckDefinition } from '../types';

function computeCheckTags(check: CheckDefinition): CheckTag[] {
  const tags: Set<CheckTag> = new Set();

  // ── World tag ──
  if (check.dungeon) {
    if (LIGHT_WORLD_DUNGEONS.has(check.dungeon)) {
      tags.add('light_world');
    } else {
      tags.add('dark_world');
    }
    tags.add('dungeon');
    const dungTag = DUNGEON_TAG_MAP[check.dungeon];
    if (dungTag) tags.add(dungTag);
  } else {
    // Overworld check — determine world from region/id
    const isDark = /Dark|Catfish|Stumpy|Pyramid|Hype Cave|Brewery|C-Shaped|Chest Game|Bumper|Mire|Superbunny|Hookshot Cave|Frog|Missing Smith|Hammer Peg/.test(check.region) ||
      /Dark|Catfish|Stumpy|Pyramid|Digging Game|Bombos Tablet|Frog|Missing Smith/.test(check.id);
    tags.add(isDark ? 'dark_world' : 'light_world');
  }

  // ── Location type (for non-dungeon checks) ──
  if (!check.dungeon) {
    if (CAVE_REGIONS.has(check.region)) {
      tags.add('cave');
    } else if (HOUSE_REGIONS.has(check.region)) {
      tags.add('house');
    } else {
      tags.add('overworld');
    }
  }

  // ── Geographic area ──
  if (!check.dungeon) {
    for (const rule of AREA_RULES) {
      if (rule.pattern instanceof Set) {
        if (rule.pattern.has(check.region)) {
          tags.add(rule.tag);
          break;
        }
      } else {
        if (rule.pattern.test(check.region) || rule.pattern.test(check.id)) {
          tags.add(rule.tag);
          break;
        }
      }
    }
  }

  // ── Content tags ──
  if (check.type === 'keyDrop') {
    tags.add('key');
    const items = Array.isArray(check.vanillaItem) ? check.vanillaItem : check.vanillaItem ? [check.vanillaItem] : [];
    if (items.some(i => i.startsWith('Big Key'))) tags.add('big_key');
  }
  if (check.type === 'boss') tags.add('boss_item');
  if (check.type === 'prize') tags.add('boss_item');
  if (check.vanillaItem) {
    const items = Array.isArray(check.vanillaItem) ? check.vanillaItem : [check.vanillaItem];
    for (const vi of items) {
      if (vi.startsWith('Small Key')) tags.add('key');
      if (vi.startsWith('Big Key')) tags.add('big_key');
      if (vi === 'Compass' || vi === 'Map' || vi.startsWith('Compass') || vi.startsWith('Map')) tags.add('map_compass');
    }
  }

  // Name-based content hints
  const name = check.name.toLowerCase();
  if (name.includes('map chest') || name.includes('compass chest')) tags.add('map_compass');
  if (name.includes('big key chest')) tags.add('big_key');

  return [...tags];
}

// ─── Pre-computed tag lookup ───
let _tagCache: Map<string, CheckTag[]> | null = null;

function getCheckTags(checks: CheckDefinition[]): Map<string, CheckTag[]> {
  if (_tagCache) return _tagCache;
  _tagCache = new Map();
  for (const check of checks) {
    _tagCache.set(check.id, computeCheckTags(check));
  }
  return _tagCache;
}

function getTagsForCheck(checkId: string, allChecks: CheckDefinition[]): CheckTag[] {
  return getCheckTags(allChecks).get(checkId) ?? [];
}

export {
  TAG_DEFINITIONS,
  computeCheckTags,
  getCheckTags,
  getTagsForCheck
};
export type { CheckTag, TagDefinition };
