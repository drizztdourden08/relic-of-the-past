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

interface ConnectionTileRange {
  axis: 'x' | 'y';
  start: number;
  end: number;
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

/**
 * Where the crossing physically sits — NOT always on a side: stairs, warps,
 * holes and many entrances sit mid-screen.
 */
type ConnectionPlacement =
  | { at: 'side'; side: ConnectionSide; tileRange?: ConnectionTileRange }
  | { at: 'area'; rect: ConnectionRect };

interface ConnectionRecord {
  id: ConnectionId;
  /** Many connections are derived from the flood, not native — no id then. */
  gameId?: ConnectionGameId;
  kind: ConnectionKind;
  fromScreenId: ScreenId;
  toScreenId: ScreenId;
  /** Replaces the old side/tileRange pair. Absent until derived — never guessed. */
  placement?: ConnectionPlacement;
  direction: 'one-way' | 'two-way';
  /** The matching connection: an entrance's exit, a warp's return, the reverse edge of a pair. */
  counterpartId?: ConnectionId;
  /** For crossings into or out of a dungeon — which one, without parsing anything. */
  dungeonId?: DungeonId;
  /** The trigger/obstacle actor MECHANISM that opens or blocks it — not a player prerequisite. */
  gatedBy?: ActorId;
  /** What the PLAYER must have or have done to use it — id-based leaves only. */
  requirements?: Requirement;
  /** Rare — most doorways are unnamed. */
  name?: string;
  /**
   * Approach + barrier + context, as references into the tag collection — read
   * the terms back with `tagKeysOf` (transit:ledge, barrier:small-key, …).
   */
  tags: readonly TagId[];
  /** Pre-computed flood-fill navigation facts — requirements, bidirectional flag, connection points. */
  nav?: ConnectionNavData;
}

export type {
  ConnectionGameId, ConnectionKind, ConnectionPlacement, ConnectionRecord,
  ConnectionRect, ConnectionSide, ConnectionTileRange,
};
