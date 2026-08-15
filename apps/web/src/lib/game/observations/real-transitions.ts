/* @layer bridge-wasm @kind logic */
/**
 * The union of every REAL in-game transition leaving the current screen, read
 * straight off the native tables.
 *
 * Indoors: the exit map plus the room's own stair/walk/warp tables. Outdoors:
 * the flood's border crossings PLUS the overworld entrances (doors) and fall
 * holes on the current area, neither of which the flood ever sees. The
 * fall-hole table is keyed by AREA, not by room, so it is overworld geography
 * and belongs to the outdoor branch alone. Flood crossings are included so a
 * consumer refreshes on re-flood.
 */

import {
  wasmGetAreaHeads, wasmGetEntranceRooms, wasmGetExitScreenMap, wasmGetFallHoles,
  wasmGetOverworldEntrances, wasmGetRoomDoorInfo, wasmGetRoomStairInfo,
  wasmGetRoomTravelDestinationsFor, wasmGetRoomWalkBoundaries,
} from '../wasm-bridge';
import type { ConnectionInfo } from '@shared/game/navigation';
import type { ObservedTransition } from '@shared/game/recommendations';

/** The area-keyed tables the outdoor collectors read, decoded once per pass. */
interface AreaTables {
  heads: Uint8Array | null;
  entranceRooms: Uint16Array | null;
}

interface RealTransitionScope {
  isIndoors: boolean;
  roomIndex: number;
  overworldScreenIndex: number;
  floodConnections: readonly ConnectionInfo[];
}

const readAreaTables = (): AreaTables =>
  ({ heads: wasmGetAreaHeads(), entranceRooms: wasmGetEntranceRooms() });

const headOf = (tables: AreaTables, area: number): number => (tables.heads ? tables.heads[area] : area);

/**
 * Rooms the fall holes on this area drop into. An entry's `.area` stores the
 * big-screen head, so membership is a head-group comparison rather than an
 * index match; 0 is the entrance table's empty slot, never a destination.
 */
const fallHoleRoomsOnArea = (overworldScreenIndex: number, tables: AreaTables): number[] => {
  const currentHead = headOf(tables, overworldScreenIndex);
  const rooms: number[] = [];
  for (const hole of wasmGetFallHoles()) {
    if (headOf(tables, hole.area) !== currentHead) continue;
    const room = tables.entranceRooms?.[hole.entranceId];
    if (room != null && room !== 0) rooms.push(room);
  }
  return rooms;
};

/** Overworld entrances (doors) on this area, resolved entrance id → room. Same
 *  head-group comparison as the fall holes above. */
const collectOverworldEntrances = (overworldScreenIndex: number, tables: AreaTables): ObservedTransition[] => {
  const currentHead = headOf(tables, overworldScreenIndex);
  const out: ObservedTransition[] = [];
  for (const entrance of wasmGetOverworldEntrances()) {
    if (headOf(tables, entrance.area) !== currentHead) continue;
    const room = tables.entranceRooms?.[entrance.id];
    if (room != null && room !== 0) out.push({ source: 'entrance', kind: 'room', index: room });
  }
  return out;
};

/** kDoorType_WarpRoomDoor — crossing it teleports to a room-header travel slot. */
const WARP_DOOR = 0x46;
/** Header travel slots the warp doors read: west takes [3], east takes [4],
 *  each a WHOLE room index. Slot [0] is movable-block bookkeeping and slots
 *  [1]/[2] are stair destinations the stair table already enumerates. */
const WARP_SLOT: Partial<Record<string, number>> = { west: 3, east: 4 };
const WARP_SLOTS: readonly number[] = [3, 4];

const roomTransitions = (rooms: readonly number[]): ObservedTransition[] =>
  rooms.filter(room => room !== 0).map(room => ({ source: 'travel', kind: 'room', index: room }));

/**
 * Warp-door destinations for the room: a header slot is a real crossing only
 * where the room actually holds a warp door reading it.
 *
 * A direction byte the bridge cannot decode arrives as `north`, which no warp
 * door is — so a decode miss would silently emit nothing and turn a live
 * crossing into a removal proposal against a correct record. When any warp
 * door lands outside the slot map, both slots are emitted instead: an
 * over-report is absorbed by the dataset join, an under-report is not.
 */
const collectWarpDestinations = (roomIndex: number): ObservedTransition[] => {
  const warpDoors = wasmGetRoomDoorInfo(roomIndex).filter(door => door.nativeType === WARP_DOOR);
  if (warpDoors.length === 0) return [];
  const destinations = wasmGetRoomTravelDestinationsFor(roomIndex) ?? [];
  const slots = warpDoors.map(door => WARP_SLOT[door.direction]);
  if (slots.some(slot => slot === undefined)) return roomTransitions(WARP_SLOTS.map(slot => destinations[slot] ?? 0));
  return roomTransitions(slots.map(slot => destinations[slot as number] ?? 0));
};

const collectIndoor = (roomIndex: number, floodConnections: readonly ConnectionInfo[]): ObservedTransition[] => {
  const out: ObservedTransition[] = [];
  const exit = wasmGetExitScreenMap().get(roomIndex);
  if (exit != null) out.push({ source: 'exit', kind: 'screen', index: exit });
  for (const stair of wasmGetRoomStairInfo()) {
    if (stair.destRoom !== 0) out.push({ source: 'stair', kind: 'room', index: stair.destRoom });
  }
  for (const boundary of wasmGetRoomWalkBoundaries()) {
    if (boundary.destRoom !== 0) out.push({ source: 'walk', kind: 'room', index: boundary.destRoom });
  }
  out.push(...collectWarpDestinations(roomIndex));
  for (const connection of floodConnections) {
    out.push({ source: 'flood', kind: 'room', index: connection.targetScreen });
  }
  return out;
};

const collectOutdoor = (
  overworldScreenIndex: number,
  floodConnections: readonly ConnectionInfo[],
): ObservedTransition[] => {
  const tables = readAreaTables();
  const out: ObservedTransition[] = [];
  for (const connection of floodConnections) {
    out.push({ source: 'flood', kind: 'screen', index: connection.targetScreen });
  }
  out.push(...collectOverworldEntrances(overworldScreenIndex, tables));
  for (const room of fallHoleRoomsOnArea(overworldScreenIndex, tables)) {
    out.push({ source: 'hole', kind: 'room', index: room });
  }
  return out;
};

const collectRealTransitions = (scope: RealTransitionScope): ObservedTransition[] => {
  const { isIndoors, roomIndex, overworldScreenIndex, floodConnections } = scope;
  return isIndoors
    ? collectIndoor(roomIndex, floodConnections)
    : collectOutdoor(overworldScreenIndex, floodConnections);
};

export { collectRealTransitions };
