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
 * A base-tile rect. Every feature is stamped by a map16 room object, so the
 * minimum footprint is one 16px collision block: `w` and `h` are always >= 2,
 * wider for pit floors and whirlpool pools.
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
  /** EVERY base tile the point occupies, contiguous. A cliff splitting a border
   *  into two gaps is TWO points, not one with a hole. May be empty. */
  tiles: readonly ConnectionTile[];
  /** BG1 / BG2. Indoors a door and the stair beneath it can share tiles. */
  layer?: 0 | 1;
}

interface ConnectionRecord {
  id: ConnectionId;
  /** The screen this point SITS ON. One record, one screen, always. */
  screenId: ScreenId;
  /** The point on the other side. ALWAYS present: every crossing registers both
   *  ends, even one-way ones. A fall hole's landing spot is a `drop` point naming the `hole`. */
  toConnectionId: ConnectionId;
  kind: ConnectionKind;
  placement: ConnectionPlacement;
  /** Whether the player can LEAVE this screen through this point. False for a
   *  receive-only point (a `drop`, a one-way warp's pad). Two-way iff BOTH ends can exit. */
  canExit: boolean;
  /** Absent on the many connections derived from the flood instead of native data. */
  gameId?: ConnectionGameId;
  /** Names the dungeon a crossing enters or leaves, so nothing has to be parsed. */
  dungeonId?: DungeonId;
  /** The trigger/obstacle actor MECHANISM that opens or blocks it. Player prerequisites go in `requirements`. */
  gatedBy?: ActorId;
  /** What the PLAYER must have or have done to use THIS side. Id-based leaves only. */
  requirements?: Requirement;
  /** Set only on the rare named doorway. */
  name?: string;
  /** Approach + barrier + context, as references into the tag collection; read
   *  the terms back with `tagKeysOf`. No `dir:*` terms: direction is derived from `canExit`. */
  tags: readonly TagId[];
  /** Pre-computed flood-fill facts. Holds requirements and this side's connection point. */
  nav?: ConnectionNavData;
}

export type {
  ConnectionForm, ConnectionGameId, ConnectionKind, ConnectionPlacement, ConnectionRecord,
  ConnectionRect, ConnectionSide, ConnectionTile,
};
