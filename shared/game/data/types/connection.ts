/* @layer shared-game @kind types */
import type { ActorId, ConnectionId, DungeonId, ScreenId, TagId } from './ids';
import type { Requirement } from './check';
import type { ConnectionNavData } from '../../navigation/nav-data.types';
import type { ConnectionKind, ConnectionSide } from '../enumeration/generated-types';

interface ConnectionGameId {
  entranceId?: number;
  stairIndex?: number;
  exitId?: number;
}

/** How the point is laid out on its screen. */
type ConnectionForm = 'border' | 'area';

/** One base tile (8px) on the screen's 64x64 grid. */
interface ConnectionTile {
  x: number;
  y: number;
}

/**
 * A base-tile rect. There is no single-tile feature: attributes are read per
 * 8px tile, but every feature is stamped by a map16 room object, so the minimum
 * footprint is one 16px collision block — `w` and `h` are always >= 2, wider
 * for pit floors and whirlpool pools.
 */
interface ConnectionRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ConnectionPlacement {
  form: ConnectionForm;
  /** Border points only: which edge the point sits on. */
  side?: ConnectionSide;
  /** Bounding box in base tiles. Denormalized from `tiles` for cheap hit-testing. */
  rect: ConnectionRect;
  /**
   * EVERY base tile the point occupies, contiguous. A cliff splitting a border
   * into two gaps is TWO points, not one point with a hole in it, which is
   * exactly what the old `tileRange: { start, end }` could not express. May be
   * empty when the migration had nothing to derive it from.
   */
  tiles: readonly ConnectionTile[];
  /** BG1 / BG2. Indoors a door and the stair beneath it can share tiles. */
  layer?: 0 | 1;
}

interface ConnectionRecord {
  id: ConnectionId;
  /** The screen this point SITS ON. One record, one screen, always. */
  screenId: ScreenId;
  /**
   * The point on the other side. ALWAYS present: every crossing registers both
   * ends, including the ones you cannot come back through. A fall hole's
   * landing spot is a real `drop` point that names the `hole` above it.
   */
  toConnectionId: ConnectionId;
  kind: ConnectionKind;
  placement: ConnectionPlacement;
  /**
   * Whether the player can LEAVE this screen through this point. False for a
   * receive-only point: a `drop`, a one-way warp's destination pad. A crossing
   * is two-way exactly when BOTH ends can exit, which is one fact held once,
   * in the only place that cannot contradict itself.
   */
  canExit: boolean;
  /** Many connections are derived from the flood, not native — no id then. */
  gameId?: ConnectionGameId;
  /** For crossings into or out of a dungeon — which one, without parsing anything. */
  dungeonId?: DungeonId;
  /** The trigger/obstacle actor MECHANISM that opens or blocks it — not a player prerequisite. */
  gatedBy?: ActorId;
  /** What the PLAYER must have or have done to use it — id-based leaves only. THIS side's. */
  requirements?: Requirement;
  /** Rare — most doorways are unnamed. */
  name?: string;
  /**
   * Approach + barrier + context, as references into the tag collection — read
   * the terms back with `tagKeysOf` (transit:ledge, barrier:small-key, …). The
   * whole `dir:*` namespace is retired: direction is derived from `canExit`.
   */
  tags: readonly TagId[];
  /** Pre-computed flood-fill navigation facts — requirements, this side's connection point. */
  nav?: ConnectionNavData;
}

export type {
  ConnectionForm, ConnectionGameId, ConnectionKind, ConnectionPlacement, ConnectionRecord,
  ConnectionRect, ConnectionSide, ConnectionTile,
};
