/**
 * Region Tag System — Single source of truth for categorizing every location
 * in A Link to the Past.
 *
 * Tags use a namespaced format: "namespace:value"
 * This enables structured queries like "give me all world:dark + type:cave" regions.
 */

// ─── Tag Namespace Definitions ───

/** Which parallel world the region belongs to */
type WorldTag = 'world:light' | 'world:dark';

/** Physical environment of the region */
type EnvironmentTag =
  | 'env:outside'       // open-air overworld areas
  | 'env:inside'        // enclosed buildings (houses, shops, temples)
  | 'env:underground'   // subterranean (caves, wells, sewers, dungeons)
  | 'env:water';        // aquatic/waterlogged areas

/** What kind of location this is */
type LocationTypeTag =
  | 'type:overworld'      // traversable overworld region
  | 'type:house'          // residential building
  | 'type:cave'           // natural cave
  | 'type:well'           // vertical well access
  | 'type:shop'           // merchant location
  | 'type:fairy'          // fairy fountain/healing spring
  | 'type:hint'           // hint NPC or fortune teller
  | 'type:gamble'         // gambling minigame
  | 'type:dungeon'        // dungeon room/section
  | 'type:passage'        // transit cave connecting two overworld areas
  | 'type:special';       // unique locations (Chris Houlihan, Pyramid, etc.)

/** Geographic area (broad regions of the map) */
type AreaTag =
  // Light World areas
  | 'area:kakariko'
  | 'area:lost_woods'
  | 'area:death_mountain'
  | 'area:east_hyrule'
  | 'area:south_hyrule'
  | 'area:lake_hylia'
  | 'area:desert'
  | 'area:hyrule_castle'
  | 'area:central_hyrule'
  // Dark World areas
  | 'area:village_of_outcasts'
  | 'area:skull_woods_area'
  | 'area:dark_death_mountain'
  | 'area:dark_east'
  | 'area:dark_south'
  | 'area:dark_lake_hylia'
  | 'area:dark_mire'
  | 'area:dark_north';

/** Which dungeon this region belongs to (if any) */
type DungeonTag =
  | 'dungeon:hyrule_castle'
  | 'dungeon:castle_tower'
  | 'dungeon:eastern_palace'
  | 'dungeon:desert_palace'
  | 'dungeon:tower_of_hera'
  | 'dungeon:palace_of_darkness'
  | 'dungeon:swamp_palace'
  | 'dungeon:skull_woods'
  | 'dungeon:thieves_town'
  | 'dungeon:ice_palace'
  | 'dungeon:misery_mire'
  | 'dungeon:turtle_rock'
  | 'dungeon:ganons_tower';

/** Functional role of the region within the game */
type RoleTag =
  | 'role:entrance'       // first room of a dungeon or building entry point
  | 'role:boss_room'      // boss fight arena
  | 'role:boss_reward'    // room where boss prize is obtained
  | 'role:treasure'       // room primarily containing treasure chests
  | 'role:puzzle'         // room with key puzzle mechanics
  | 'role:dark_room'      // requires lamp to navigate
  | 'role:hub'            // major branching point / intersection
  | 'role:connector'      // passage linking two major areas
  | 'role:safe_zone'      // no enemies (sanctuaries, houses)
  | 'role:spawn_point'    // save & quit / respawn destination
  | 'role:drop_zone';     // one-way fall/drop entry

/** All valid region tags */
type RegionTag =
  | WorldTag
  | EnvironmentTag
  | LocationTypeTag
  | AreaTag
  | DungeonTag
  | RoleTag;

export type {
  AreaTag,
  DungeonTag,
  EnvironmentTag,
  LocationTypeTag,
  RegionTag,
  RoleTag,
  WorldTag,
};

// ─── Tag Metadata (for UI display & filtering) ───

interface TagMetadata {
  id: RegionTag;
  label: string;
  namespace: 'world' | 'env' | 'type' | 'area' | 'dungeon' | 'role';
}

const TAG_METADATA: TagMetadata[] = [
  // World
  { id: 'world:light', label: 'Light World', namespace: 'world' },
  { id: 'world:dark', label: 'Dark World', namespace: 'world' },

  // Environment
  { id: 'env:outside', label: 'Outside', namespace: 'env' },
  { id: 'env:inside', label: 'Inside', namespace: 'env' },
  { id: 'env:underground', label: 'Underground', namespace: 'env' },
  { id: 'env:water', label: 'Water', namespace: 'env' },

  // Location types
  { id: 'type:overworld', label: 'Overworld', namespace: 'type' },
  { id: 'type:house', label: 'House', namespace: 'type' },
  { id: 'type:cave', label: 'Cave', namespace: 'type' },
  { id: 'type:well', label: 'Well', namespace: 'type' },
  { id: 'type:shop', label: 'Shop', namespace: 'type' },
  { id: 'type:fairy', label: 'Fairy Fountain', namespace: 'type' },
  { id: 'type:hint', label: 'Hint', namespace: 'type' },
  { id: 'type:gamble', label: 'Gambling Game', namespace: 'type' },
  { id: 'type:dungeon', label: 'Dungeon', namespace: 'type' },
  { id: 'type:passage', label: 'Passage', namespace: 'type' },
  { id: 'type:special', label: 'Special', namespace: 'type' },

  // Light World areas
  { id: 'area:kakariko', label: 'Kakariko Village', namespace: 'area' },
  { id: 'area:lost_woods', label: 'Lost Woods', namespace: 'area' },
  { id: 'area:death_mountain', label: 'Death Mountain', namespace: 'area' },
  { id: 'area:east_hyrule', label: 'East Hyrule', namespace: 'area' },
  { id: 'area:south_hyrule', label: 'South Hyrule', namespace: 'area' },
  { id: 'area:lake_hylia', label: 'Lake Hylia', namespace: 'area' },
  { id: 'area:desert', label: 'Desert', namespace: 'area' },
  { id: 'area:hyrule_castle', label: 'Hyrule Castle', namespace: 'area' },
  { id: 'area:central_hyrule', label: 'Central Hyrule', namespace: 'area' },

  // Dark World areas
  { id: 'area:village_of_outcasts', label: 'Village of Outcasts', namespace: 'area' },
  { id: 'area:skull_woods_area', label: 'Skull Woods Area', namespace: 'area' },
  { id: 'area:dark_death_mountain', label: 'Dark Death Mountain', namespace: 'area' },
  { id: 'area:dark_east', label: 'Dark East', namespace: 'area' },
  { id: 'area:dark_south', label: 'Dark South', namespace: 'area' },
  { id: 'area:dark_lake_hylia', label: 'Dark Lake Hylia', namespace: 'area' },
  { id: 'area:dark_mire', label: 'Dark Mire', namespace: 'area' },
  { id: 'area:dark_north', label: 'Dark North', namespace: 'area' },

  // Dungeons
  { id: 'dungeon:hyrule_castle', label: 'Hyrule Castle', namespace: 'dungeon' },
  { id: 'dungeon:castle_tower', label: 'Castle Tower', namespace: 'dungeon' },
  { id: 'dungeon:eastern_palace', label: 'Eastern Palace', namespace: 'dungeon' },
  { id: 'dungeon:desert_palace', label: 'Desert Palace', namespace: 'dungeon' },
  { id: 'dungeon:tower_of_hera', label: 'Tower of Hera', namespace: 'dungeon' },
  { id: 'dungeon:palace_of_darkness', label: 'Palace of Darkness', namespace: 'dungeon' },
  { id: 'dungeon:swamp_palace', label: 'Swamp Palace', namespace: 'dungeon' },
  { id: 'dungeon:skull_woods', label: 'Skull Woods', namespace: 'dungeon' },
  { id: 'dungeon:thieves_town', label: "Thieves' Town", namespace: 'dungeon' },
  { id: 'dungeon:ice_palace', label: 'Ice Palace', namespace: 'dungeon' },
  { id: 'dungeon:misery_mire', label: 'Misery Mire', namespace: 'dungeon' },
  { id: 'dungeon:turtle_rock', label: 'Turtle Rock', namespace: 'dungeon' },
  { id: 'dungeon:ganons_tower', label: "Ganon's Tower", namespace: 'dungeon' },

  // Roles
  { id: 'role:entrance', label: 'Entrance', namespace: 'role' },
  { id: 'role:boss_room', label: 'Boss Room', namespace: 'role' },
  { id: 'role:boss_reward', label: 'Boss Reward', namespace: 'role' },
  { id: 'role:treasure', label: 'Treasure Room', namespace: 'role' },
  { id: 'role:puzzle', label: 'Puzzle Room', namespace: 'role' },
  { id: 'role:dark_room', label: 'Dark Room', namespace: 'role' },
  { id: 'role:hub', label: 'Hub / Intersection', namespace: 'role' },
  { id: 'role:connector', label: 'Connector', namespace: 'role' },
  { id: 'role:safe_zone', label: 'Safe Zone', namespace: 'role' },
  { id: 'role:spawn_point', label: 'Spawn Point', namespace: 'role' },
  { id: 'role:drop_zone', label: 'Drop Zone', namespace: 'role' },
];

export { TAG_METADATA };
export type { TagMetadata };

// ─── Utility: query regions by tags ───

/**
 * Returns true if the region has ALL of the specified tags.
 */
function hasAllTags(regionTags: readonly RegionTag[], required: RegionTag[]): boolean {
  return required.every(t => regionTags.includes(t));
}

/**
 * Returns true if the region has ANY of the specified tags.
 */
function hasAnyTag(regionTags: readonly RegionTag[], candidates: RegionTag[]): boolean {
  return candidates.some(t => regionTags.includes(t));
}

/**
 * Extracts the namespace from a tag string.
 */
function getTagNamespace(tag: RegionTag): string {
  return tag.split(':')[0];
}

/**
 * Extracts the value from a tag string.
 */
function getTagValue(tag: RegionTag): string {
  return tag.split(':')[1];
}

export { getTagNamespace, getTagValue, hasAllTags, hasAnyTag };
