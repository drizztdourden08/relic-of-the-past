/* @layer shared-game @kind types */
import type { ActorId, ConnectionId, DungeonId, ScreenId } from './ids';
import type { Requirement } from './check';
import type { ConnectionTag } from '../taxonomy/connection-tags';
import type { ConnectionNavData } from '../../navigation/nav-data.types';

interface ConnectionGameId {
  entranceId?: number;
  stairIndex?: number;
  exitId?: number;
}

/**
 * The six transitions the game itself performs — each one takes control away
 * from the player to move them between screens. Everything else the old
 * `transit:*` vocabulary named (walk, swim, ledge, waterfall, grave, bomb,
 * bonk, rock, push, hookshot) is HOW you reach or clear a crossing, not the
 * crossing itself, so those stay tags.
 */
type ConnectionKind =
  /** Scroll across a boundary: overworld border, big-room section boundary. */
  | 'edge'
  /** Room ↔ room doorway. Shutter/key/bomb doors are the SAME kind, gated. */
  | 'door'
  /** Overworld ↔ interior threshold (the entranceId / exitId pair). */
  | 'entrance'
  /** Inter-room / inter-floor staircase (the native stair table). */
  | 'stairs'
  /** Any fall-through: a pit to the room below, an overworld hole into a cave. */
  | 'hole'
  /** Warp tiles, whirlpools, cross-world portals. */
  | 'teleport';

type ConnectionSide = 'north' | 'south' | 'east' | 'west' | 'up' | 'down';

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
  /** Approach + barrier + context: transit:ledge, barrier:small-key, ctx:cross-world… */
  tags: readonly ConnectionTag[];
  /** Pre-computed flood-fill navigation facts — requirements, bidirectional flag, connection points. */
  nav?: ConnectionNavData;
}

export type {
  ConnectionGameId, ConnectionKind, ConnectionPlacement, ConnectionRecord,
  ConnectionRect, ConnectionSide, ConnectionTileRange,
};
