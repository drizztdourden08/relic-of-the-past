/**
 * Navigation Data Types
 *
 * These types are embedded into the existing RegionDefinition and RegionConnection
 * interfaces via optional `nav` fields. The analysis script populates them;
 * the runtime pathfinder reads them.
 *
 * Design principle: EXTEND existing data, never replace it.
 *   - RegionDefinition.nav?: RegionNavData
 *   - RegionConnection.nav?: ConnectionNavData
 */

// ─── Traversal Requirements ─────────────────────────────────────────────────

/**
 * Every traversal requirement the flood fill tests for.
 *
 * VERIFIED (working in classifier):
 *   lift.1, lift.2, boots, flippers
 *
 * NEEDS USER TESTING:
 *   hammer, hookshot, bombs, sword, boomerang, mirror
 *
 * PROGRESSION (not tile-level):
 *   agahnim.0, agahnim.1, rescue_zelda, castle_gate, moonpearl,
 *   flute, cape, byrna, somaria, book, firerod, icerod, lamp,
 *   bow, bombos, ether, quake
 */
type TraversalRequirement =
  | 'lift.1' | 'lift.2' | 'lift.3'
  | 'sword' | 'boomerang' | 'bombs' | 'hammer' | 'powder'
  | 'boots' | 'flippers' | 'hookshot' | 'mirror' | 'moonpearl'
  | 'flute' | 'cape' | 'byrna' | 'somaria'
  | 'bow' | 'firerod' | 'icerod' | 'lamp'
  | 'bombos' | 'ether' | 'quake'
  | 'book' | 'shovel' | 'net' | 'bottle'
  | 'agahnim.0' | 'agahnim.1' | 'rescue_zelda' | 'castle_gate'
  | `smallkey:${string}` | `bigkey:${string}`
  ;

/**
 * OR-of-AND requirement logic.
 *   [['lift.1']]                 → needs base lift (Link has from start)
 *   [['sword'], ['boomerang']]   → needs sword OR boomerang
 *   [['hammer', 'lift.1']]       → needs BOTH
 *   []                           → no requirements
 */
type RequirementSet = TraversalRequirement[][];

// ─── Connection Transit Types ───────────────────────────────────────────────

type ConnectionTransitType =
  | 'walk'            // Screen border crossing (positional 1:1)
  | 'door'            // Enter/exit building
  | 'passage'         // Through-building connecting two overworld areas
  | 'hole'            // Fall through pit (one-way down)
  | 'staircase'       // Interior stairs between floors
  | 'ledge'           // One-way jump off ledge
  | 'mirror'          // DW → LW warp (same position)
  | 'flute'           // Flute teleport to fixed point
  | 'dungeon_enter'   // Overworld → dungeon first room
  | 'dungeon_exit'    // Dungeon → overworld
  | 'whirlpool'       // Water warp
  | 'warp_tile'       // Dungeon warp pad
  ;

// ─── Screen Nav Data (goes into ScreenDefinition.nav) ───────────────────────

/**
 * Navigation data for a single screen.
 * Populated by the analysis script, read by the pathfinder.
 */
interface RegionNavData {
  /** Total tiles in grid (4096 for overworld 64×64) */
  totalTiles: number;

  /** Tiles walkable with NO items (from primary entry) */
  freeTileCount: number;

  /** Tiles reachable with ALL items */
  maxReachableTileCount: number;

  /** Connection point IDs present on this screen */
  connectionPointIds: string[];

  /** Obstacles that gate navigation on this screen */
  obstacles: NavObstacle[];

  /** Notable features for routing/display */
  features: NavFeature[];

  /** Progression-dependent changes to this screen */
  variants?: NavVariant[];
}

// ─── Connection Nav Data (goes into RegionConnection.nav) ───────────────────

/**
 * Navigation data for a single connection.
 * Populated by the analysis script, read by the pathfinder.
 */
interface ConnectionNavData {
  /** Physical traversal type */
  transitType: ConnectionTransitType;

  /** Requirements for this connection. OR-of-AND. */
  requirements: RequirementSet;

  /** Explicit bidirectional flag (faster than checking tags at runtime) */
  bidirectional: boolean;

  /** Source-side connection point bundle */
  fromPoint?: ConnectionPointData;

  /** Destination-side connection point bundle */
  toPoint?: ConnectionPointData;

  /**
   * For walk connections: overlapping tile positions (0–63) where
   * BOTH screens have reachable border tiles. This is the actual corridor.
   */
  overlapTiles?: number[];

  /** Traversal cost (tile distance for walks, 1 for instant transitions) */
  weight: number;

  /** Only valid after this progression event */
  validAfter?: string;

  /** Flagged as invalid by analysis (0 overlap, unreachable, etc.) */
  invalid?: boolean;
}

// ─── Connection Point Data ──────────────────────────────────────────────────

/**
 * A connection point is a bundle of tiles that forms one logical entry/exit.
 * If a cliff splits a border into two gaps, that's two separate connection points.
 */
interface ConnectionPointData {
  /**
   * Unique ID.
   * Convention: "{world}-{screen:hex}-{type}-{dir}-{index}"
   * Examples: "lw-38-edge-e-0", "lw-29-door-0", "int-011f-exit-e"
   */
  id: string;

  /** Border direction (for edge types) */
  direction?: 'n' | 's' | 'e' | 'w';

  /**
   * Tile positions (0–63) in this bundle.
   * For N/S edges: column positions. For E/W edges: row positions.
   * Always contiguous (no gaps within one bundle).
   */
  tiles: number[];

  /** Requirements to REACH this point from the screen's walkable interior */
  requirements: RequirementSet;

  /** For entrance types: position on the 64×64 grid */
  position?: { row: number; col: number };

  /** For entrance types: game's internal entrance index */
  entranceIndex?: number;

  /** Directionality constraint */
  oneWay: null | 'exit' | 'enter';
}

// ─── Nav Obstacle ───────────────────────────────────────────────────────────

interface NavObstacle {
  /** Position on the 64×64 grid */
  position: { row: number; col: number };

  /** Raw ROM tile attribute byte */
  tileAttr: number;

  /** Human-readable obstacle type */
  type: 'bush' | 'light_rock' | 'dark_rock' | 'hammer_peg' | 'bonk_rock'
    | 'deep_water' | 'bombable_wall' | 'hookshot_gap' | 'spike_floor';

  /** Requirements to clear/pass. OR-of-AND. */
  requirements: RequirementSet;

  /** If this obstacle directly gates a connection point */
  gatesPoint?: string;
}

// ─── Nav Feature ────────────────────────────────────────────────────────────

interface NavFeature {
  type: 'hookshot_target' | 'ledge_drop' | 'fairy_fountain' | 'flute_landing'
    | 'torch' | 'switch_crystal' | 'push_block' | 'warp_pad' | 'signpost'
    | 'npc' | 'chest' | 'heart_piece';

  position: { row: number; col: number };

  /** Extra data (e.g., ledge direction, NPC id) */
  metadata?: Record<string, unknown>;
}

// ─── Nav Variant ────────────────────────────────────────────────────────────

interface NavVariant {
  /** What game event triggers this layout change */
  trigger: 'agahnim.0' | 'agahnim.1' | 'rain_ended' | 'flute_activated'
    | 'smith_rescued' | 'castle_opened';

  /** Connection points added when trigger is met */
  pointsAdded?: string[];

  /** Connection points removed when trigger is met */
  pointsRemoved?: string[];

  /** Additional description for debugging */
  description?: string;
}

export type { TraversalRequirement, RequirementSet, ConnectionTransitType, RegionNavData, ConnectionNavData, ConnectionPointData, NavObstacle, NavFeature, NavVariant };
