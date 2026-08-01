/* @layer shared-game @kind types */
import type { ScreenTag, ConnectionTag } from '../data';
import type { RegionNavData, ConnectionNavData } from '../navigation/nav-data.types';

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN DATA MODEL
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * The three fundamental screen contexts in ALttP:
 * - overworld: outdoor OW screens (64 per world, indexed 0x00–0x3F)
 * - dungeon: indoor rooms belonging to a dungeon (keyed by palace index + room)
 * - interior: all other indoor rooms (caves, houses, shops, fairy, etc.)
 */
type ScreenType = 'overworld' | 'dungeon' | 'interior';

/** Which game world this screen belongs to */
type World = 'light' | 'dark';

/** Sub-category for interior screens */
type InteriorKind =
  | 'house'
  | 'cave'
  | 'shop'
  | 'fairy'
  | 'well'
  | 'passage'
  | 'hint'
  | 'gamble'
  | 'special';

// ─── Type-Specific Context ───

interface OverworldContext {
  /** Column in 8×8 OW grid */
  gridX: number;
  /** Row in 8×8 OW grid */
  gridY: number;
}

interface DungeonContext {
  /** Runtime cur_palace_index_x2 (0x00–0x1A) — the canonical dungeon identifier.
   *  The dungeon entity is resolved from it via `dungeonForPalaceIndex`. */
  palaceIndex: number;
  /** Floor level (-2, -1, 0, 1, 2...) */
  floor?: number;
  /** Column in dungeon room grid (for map rendering) */
  gridX?: number;
  /** Row in dungeon room grid (for map rendering) */
  gridY?: number;
}

interface InteriorContext {
  /** What kind of interior this is */
  kind: InteriorKind;
}

// ─── Variant Conditions ───

/**
 * Conditions that determine when a screen variant is active.
 * Multiple variants of the same roomIndex can coexist — the first
 * whose condition evaluates to true at runtime wins.
 */
type VariantCondition =
  | { type: 'flag'; address: number; bit: number; value: boolean }
  | { type: 'check'; name: string; collected: boolean }
  | { type: 'entrance'; id: number }
  | { type: 'progress'; min?: number; max?: number }
  | { type: 'always' };

interface ScreenVariantInfo {
  /** Unique key identifying this variant (e.g., 'intro', 'post-boss') */
  key: string;
  /** Human-readable label */
  label?: string;
  /** The raw sram_progress_indicator byte value(s) this variant corresponds to */
  progressTier?: number | [number, number];
  /** Condition that makes this variant active at runtime */
  condition: VariantCondition;
}

// ─── Bundle Definition ───

/**
 * Groups multiple screens that are logically "one area" in the game.
 * OW bundles: Lost Woods (4 screens). Interior bundles: Two Brothers House (2 rooms).
 * Dungeon bundles: large rooms spanning multiple supertiles.
 */
interface ScreenBundle {
  id: string;
  name: string;
  /** IDs of screens that form this bundle (ordered) */
  screens: readonly string[];
  layout?: BundleLayout;
}

type BundleLayout =
  | { type: 'grid'; columns: number }
  | { type: 'linear'; direction: 'horizontal' | 'vertical' }
  | { type: 'stacked' };

// ─── Screen Definition (discriminated union) ───

interface ScreenBase {
  id: string;
  /** Screen-specific label ("Dark Cross", "Chest Area", "Lost Woods NW") */
  name: string;
  /** Which game world */
  world: World;
  /** Structural parent — all screens sharing a location are "one place" */
  location: string;
  /** Broad zone for notification line 2 (e.g. "Death Mountain", "Kakariko") */
  area: string;

  // ─── Game Values ───
  /** Native game room/screen index */
  roomIndex?: number;
  /** Entrance ID (RAM $010E) — disambiguates shared room indices */
  entranceId?: number;

  // ─── Variant ───
  /** When present, this screen definition is conditional on game state.
   *  Multiple definitions can share the same roomIndex with different variants.
   *  The variant with a matching condition takes priority; omitted = default/fallback. */
  variant?: ScreenVariantInfo;

  // ─── Workflow ───
  status?: 'draft' | 'mapped' | 'verified';

  // ─── Metadata ───
  tags: readonly ScreenTag[];
  nav?: RegionNavData;
}

interface OverworldScreen extends ScreenBase {
  type: 'overworld';
  overworld: OverworldContext;
}

interface DungeonScreen extends ScreenBase {
  type: 'dungeon';
  dungeon: DungeonContext;
}

interface InteriorScreen extends ScreenBase {
  type: 'interior';
  interior: InteriorContext;
}

type ScreenDefinition = OverworldScreen | DungeonScreen | InteriorScreen;

// ─── Connection ───

interface ScreenConnection {
  from: string;
  to: string;
  tags: readonly ConnectionTag[];
  /** Entrance ID for OW → indoor transitions */
  entranceId?: number;
  /** Stair index (0-3) for inter-room connections */
  stairIndex?: number;
  /** Exit data index for indoor → OW transitions */
  exitId?: number;
  status?: 'draft' | 'mapped' | 'verified';
  nav?: ConnectionNavData;
}

export type {
  BundleLayout,
  DungeonContext,
  DungeonScreen,
  InteriorContext,
  InteriorKind,
  InteriorScreen,
  OverworldContext,
  OverworldScreen,
  ScreenBase,
  ScreenBundle,
  ScreenConnection,
  ScreenDefinition,
  ScreenType,
  ScreenVariantInfo,
  VariantCondition,
  World,
};
