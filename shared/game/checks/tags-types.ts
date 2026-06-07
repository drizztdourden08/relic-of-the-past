/* @layer shared-game @kind types */
/** Tag system types for checks (filtering, searching, grouping). */

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

export type { CheckTag, TagDefinition };
