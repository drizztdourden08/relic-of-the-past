/* @layer bridge-wasm @kind logic */
import type { ConnectionInfo, FloodFillResult, ScreenCrossing, ScreenCrossings } from '@shared/game/navigation';
import { usableEntranceTransition } from '@shared/game/navigation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import { wasmGetExitScreenMap, wasmGetRoomDoorInfo } from './wasm-bridge';
import { isFollowerActive } from './follower-state';
import { FALL_HOLE_ID_BASE } from './flood/overworld-entrances';
import { doorwayLandingOpen, exitDoorAt, ROOM_EDGE_ADJ } from './simulator/room-doorways';
import { usesCachedEntrance } from './simulator/screen-resolve';
import type { EdgeName } from './simulator/exit-order';

/**
 * Widest a room-to-room crossing can be and still be a doorway.
 *
 * A supertile's outer padding ring is open tiles all the way round, so a flood
 * that gets into it anywhere runs the whole perimeter and reports a crossing
 * spanning most of every edge. A real doorway is a notch a few tiles wide; the
 * first castle's own room-to-room walks measure 2 to 6.
 */
const MAX_DOORWAY_SPAN = 12;

/** kDoorType_WarpRoomDoor teleports; kDoorType_ThroneRoom is a push wall. */
const WARP_DOOR = 0x46;
const THRONE_DOOR = 0x14;
/** How far from a blocked door record a wall spot still belongs to it. */
const BLOCKED_SPREAD = 4;

interface CrossingFilterScope {
  isIndoors: boolean;
  /** Room index when indoors; ignored outdoors. */
  roomIndex: number;
  /** The border bundles the edges were built from — a `ScreenCrossing` carries
   *  neither the tile span nor the free-tile count the filters need. */
  connections: readonly ConnectionInfo[];
  /** The flood the crossings were collected over, when the caller ran one. */
  flood?: FloodFillResult;
  items?: readonly TileReq[];
}

const spanOf = (positions: readonly number[]): string =>
  positions.length === 0 ? '?' : `${Math.min(...positions)}-${Math.max(...positions)}`;

const midOf = (positions: readonly number[]): number =>
  positions[Math.floor(positions.length / 2)] ?? 32;

/** The id the facade mints for a border bundle — the join between the two. */
const connectionCrossingId = (connection: ConnectionInfo): string =>
  `edge:${connection.edge}:${spanOf(connection.positions)}`;

const bundlesById = (connections: readonly ConnectionInfo[]): Map<string, ConnectionInfo> => {
  const map = new Map<string, ConnectionInfo>();
  for (const connection of connections) {
    if (!map.has(connectionCrossingId(connection))) map.set(connectionCrossingId(connection), connection);
  }
  return map;
};

/** Rooms the game can leave straight to the overworld. Two of them never scroll
 *  into one another: each is the mouth of a different cave, house or dungeon. */
const isStandaloneInterior = (roomIndex: number): boolean =>
  usesCachedEntrance(roomIndex) || wasmGetExitScreenMap().has(roomIndex);

/**
 * Wall spots a warp door or an unopened push wall occupies. Crossing one
 * teleports or is refused, so it never scrolls to the adjacent room.
 */
const blockedSpots = (roomIndex: number): { edge: EdgeName; pos: number }[] => {
  const follower = isFollowerActive();
  return wasmGetRoomDoorInfo(roomIndex)
    .filter((door) => door.nativeType === WARP_DOOR || (door.nativeType === THRONE_DOOR && !follower))
    .map((door) => ({
      edge: door.direction as EdgeName,
      pos: door.direction === 'north' || door.direction === 'south' ? door.col : door.row,
    }));
};

/** True when this wall spot walks OUT of the dungeon rather than into a room. */
const isExitSpot = (roomIndex: number, blocked: { edge: EdgeName; pos: number }[], edge: EdgeName, pos: number): boolean =>
  blocked.some((spot) => spot.edge === edge && Math.abs(spot.pos - pos) <= BLOCKED_SPREAD)
  || exitDoorAt(roomIndex, edge, pos);

/**
 * A room-to-room scroll the player can really walk: a doorway-width notch, in a
 * wall that is not an exit-door trigger, with floor behind it on the neighbour's
 * side, between two rooms that are not both mouths onto the overworld.
 */
const indoorEdgeUsable = (
  connection: ConnectionInfo,
  roomIndex: number,
  blocked: { edge: EdgeName; pos: number }[],
): boolean => {
  if (connection.positions.length > MAX_DOORWAY_SPAN) return false;
  const adj = ROOM_EDGE_ADJ[connection.edge](roomIndex);
  if (adj === null) return false;
  if (isStandaloneInterior(roomIndex) && isStandaloneInterior(adj)) return false;
  const mid = midOf(connection.positions);
  if (isExitSpot(roomIndex, blocked, connection.edge, mid)) return false;
  return doorwayLandingOpen(adj, connection.edge, mid);
};

const edgeUsable = (
  crossing: ScreenCrossing,
  bundles: Map<string, ConnectionInfo>,
  scope: CrossingFilterScope,
  blocked: { edge: EdgeName; pos: number }[],
): boolean => {
  if (crossing.isIntraRoom) return false;
  const connection = bundles.get(crossing.id);
  if (!connection) return false;
  if (!scope.isIndoors) return connection.freeTileCount > 0;
  return indoorEdgeUsable(connection, scope.roomIndex, blocked);
};

/**
 * The id the FLOOD knows a crossing by. Outdoors a pit is seeded at
 * `FALL_HOLE_ID_BASE + id` so it never collides with a door sharing its number;
 * every other crossing keeps the number its own table gives it.
 */
const floodEntranceIdOf = (crossing: ScreenCrossing, isIndoors: boolean): number | null => {
  const [prefix, tail] = crossing.id.split(':');
  if (prefix !== 'ent' && prefix !== 'hole' && prefix !== 'stair' && prefix !== 'bound') return null;
  const id = Number(tail);
  if (Number.isNaN(id)) return null;
  return prefix === 'hole' && !isIndoors ? FALL_HOLE_ID_BASE + id : id;
};

/**
 * Entrance ids the flood TOUCHED but the player cannot take: every transition
 * onto them is gated by a tile requirement the loadout does not meet — the
 * stairs buried under a rock, whose proximity trigger fires from beside it while
 * the way in stays sealed. Table-read crossings carry no gate of their own, so
 * without this the run walks through the rock.
 */
const gatedEntranceIds = (result: FloodFillResult, items: readonly TileReq[]): Set<number> => {
  const touched = new Set<number>();
  const open = new Set<number>();
  for (const t of result.transitions) {
    if (t.edge !== 'entrance' || t.entranceIdx == null) continue;
    touched.add(t.entranceIdx);
    if (usableEntranceTransition(result, t, items)) open.add(t.entranceIdx);
  }
  for (const id of open) touched.delete(id);
  return touched;
};

/**
 * ONE plausibility pass over a collected screen, so the simulator, the
 * recommendations and anything else reading the facade see the same set. The
 * facade emits every crossing the game's tables describe; this decides which of
 * them the player could actually walk.
 */
const usableCrossings = (crossings: ScreenCrossings, scope: CrossingFilterScope): ScreenCrossings => {
  const bundles = bundlesById(scope.connections);
  const blocked = scope.isIndoors ? blockedSpots(scope.roomIndex) : [];
  const gated = scope.flood ? gatedEntranceIds(scope.flood, scope.items ?? scope.flood.items ?? []) : null;
  return {
    ...crossings,
    entrances: crossings.entrances.filter((crossing) => {
      const id = floodEntranceIdOf(crossing, scope.isIndoors);
      return !(gated && id !== null && gated.has(id));
    }),
    edges: crossings.edges.filter((crossing) => edgeUsable(crossing, bundles, scope, blocked)),
  };
};

/**
 * Whether a traversal consumer may walk this crossing.
 *
 * A border bundle answers to the filters that built it, never to `available`:
 * one item-gated tile anywhere along the run puts that item on the WHOLE
 * bundle's requirements, so judging it that way deletes a crossing whose other
 * tiles are plain floor. Everything else asks for its own cheapest approach and
 * can be judged directly.
 */
const takeableCrossing = (crossing: ScreenCrossing): boolean =>
  crossing.class === 'edge' || crossing.available;

export { usableCrossings, takeableCrossing, connectionCrossingId, midOf };
export type { CrossingFilterScope };
