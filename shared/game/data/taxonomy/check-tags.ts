/* @layer shared-game @kind data */
/**
 * Check tag taxonomy — labels only. Ported from checks/tags-types.ts (the union)
 * and the TAG_DEFINITIONS half of checks/tag-rules.ts; the classification rules
 * (DUNGEON_TAG_MAP, CAVE_SCREENS, HOUSE_SCREENS, AREA_RULES) fold into each
 * entity's own tags array instead of a separate lookup table.
 */

type CheckTag =
  | 'light_world' | 'dark_world'
  | 'dungeon' | 'cave' | 'house' | 'overworld'
  | 'kakariko' | 'death_mountain' | 'lost_woods' | 'eastern_area' | 'southern_area'
  | 'lake_hylia' | 'desert' | 'hyrule_castle_area' | 'central_hyrule'
  | 'dark_death_mountain' | 'dark_east' | 'dark_south' | 'dark_west' | 'dark_north' | 'dark_mire_area'
  | 'dark_lake_hylia' | 'skull_woods_area' | 'village_of_outcasts'
  | 'key' | 'big_key' | 'map_compass' | 'boss_item' | 'progression' | 'junk'
  | 'hyrule_castle' | 'castle_tower' | 'eastern_palace' | 'desert_palace' | 'tower_of_hera'
  | 'palace_of_darkness' | 'swamp_palace' | 'skull_woods' | 'thieves_town' | 'ice_palace'
  | 'misery_mire' | 'turtle_rock' | 'ganons_tower';

interface CheckTagDefinition {
  id: CheckTag;
  label: string;
  category: 'world' | 'location' | 'area' | 'content' | 'dungeon';
}

const CHECK_TAG_DEFINITIONS: CheckTagDefinition[] = [
  { id: 'light_world', label: 'Light World', category: 'world' },
  { id: 'dark_world', label: 'Dark World', category: 'world' },
  { id: 'dungeon', label: 'Dungeon', category: 'location' },
  { id: 'cave', label: 'Cave', category: 'location' },
  { id: 'house', label: 'House', category: 'location' },
  { id: 'overworld', label: 'Overworld', category: 'location' },
  { id: 'kakariko', label: 'Kakariko', category: 'area' },
  { id: 'death_mountain', label: 'Death Mountain', category: 'area' },
  { id: 'lost_woods', label: 'Lost Woods', category: 'area' },
  { id: 'eastern_area', label: 'East Hyrule', category: 'area' },
  { id: 'southern_area', label: 'South Hyrule', category: 'area' },
  { id: 'lake_hylia', label: 'Lake Hylia', category: 'area' },
  { id: 'desert', label: 'Desert', category: 'area' },
  { id: 'hyrule_castle_area', label: 'Hyrule Castle Area', category: 'area' },
  { id: 'central_hyrule', label: 'Central Hyrule', category: 'area' },
  { id: 'dark_death_mountain', label: 'Dark Death Mountain', category: 'area' },
  { id: 'dark_east', label: 'Dark East', category: 'area' },
  { id: 'dark_south', label: 'Dark South', category: 'area' },
  { id: 'dark_west', label: 'Dark West', category: 'area' },
  { id: 'dark_north', label: 'Dark North', category: 'area' },
  { id: 'dark_mire_area', label: 'Mire Area', category: 'area' },
  { id: 'dark_lake_hylia', label: 'Dark Lake Hylia', category: 'area' },
  { id: 'skull_woods_area', label: 'Skull Woods Area', category: 'area' },
  { id: 'village_of_outcasts', label: 'Village of Outcasts', category: 'area' },
  { id: 'key', label: 'Key', category: 'content' },
  { id: 'big_key', label: 'Big Key', category: 'content' },
  { id: 'map_compass', label: 'Map/Compass', category: 'content' },
  { id: 'boss_item', label: 'Boss Item', category: 'content' },
  { id: 'progression', label: 'Progression', category: 'content' },
  { id: 'junk', label: 'Junk', category: 'content' },
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

export { CHECK_TAG_DEFINITIONS };
export type { CheckTag, CheckTagDefinition };
