/* @layer bridge-wasm @kind logic */
import type { ScreenCrossing } from '@shared/game/navigation';
import { wasmGetRoomDoorInfo, wasmGetRoomTravelDestinationsFor } from '../../';
import { doorwayLandingOpen, exitDoorAt, outerWall, OPPOSITE, ROOM_EDGE_ADJ } from '../../simulator/room-doorways';
import { regionQualifier } from '../../simulator/screen-resolve';
import { isFollowerActive } from '../../follower-state';
import type { EdgeName } from '../../simulator/exit-order';
import { entryFromEdge, exitFromEdge } from '../../simulator/exit-order';
import { doorCrossingTile } from '../place-tile';
import { roomTarget } from '../resolve-target';
import { makeCrossing } from '../make-crossing';
import type { CrossingPass } from '../crossings.type';

/** kDoorType_WarpRoomDoor — crossing it teleports to a header travel slot. */
const WARP_DOOR = 0x46;
/** Header travel slots the warp doors read: a west door takes [3], east [4]. */
const WARP_SLOT: Partial<Record<string, number>> = { west: 3, east: 4 };
const WARP_SLOTS: readonly number[] = [3, 4];

const positionOn = (edge: EdgeName, door: { row: number; col: number }): number =>
  edge === 'north' || edge === 'south' ? door.col : door.row;

/**
 * Warp doors, each resolved through the slot its direction reads. A direction
 * the bridge could not decode arrives as `north`, which no warp door is, so THAT
 * door emits both slots instead of silently none — the other doors in the room
 * still resolve normally.
 */
const warpCrossings = (pass: CrossingPass): ScreenCrossing[] => {
  const roomIndex = pass.scope.roomIndex;
  const doors = wasmGetRoomDoorInfo(roomIndex).filter((door) => door.nativeType === WARP_DOOR);
  if (doors.length === 0) return [];
  const destinations = wasmGetRoomTravelDestinationsFor(roomIndex) ?? [];
  const out: ScreenCrossing[] = [];
  for (const door of doors) {
    const own = WARP_SLOT[door.direction];
    for (const slot of own === undefined ? WARP_SLOTS : [own]) {
      const destRoom = destinations[slot] ?? 0;
      if (destRoom === 0) continue;
      out.push(makeCrossing(pass, {
        id: `warp:${door.row},${door.col}:${slot}`,
        class: 'entrance',
        kind: 'teleport',
        origin: 'warp-slot',
        tile: doorCrossingTile({ row: door.row, col: door.col, direction: door.direction }, pass.reachable),
        side: door.direction,
        target: roomTarget(destRoom),
        edgeSig: `w${door.direction}`,
      }));
    }
  }
  return out;
};

interface DoorwayCandidate {
  edge: EdgeName;
  pos: number;
  tile: { row: number; col: number };
  adj: number;
  /** The door's native type, which decides whether crossing it is gated. */
  nativeType: number;
}

/** kDoorType_ThroneRoom — a push wall that opens only with the follower in tow. */
const FOLLOWER_DOOR = 0x14;
const FOLLOWER_REQ = 'follower';

const requirementsFor = (nativeType: number): string[] =>
  nativeType === FOLLOWER_DOOR && !isFollowerActive() ? [FOLLOWER_REQ] : [];

/** Outer-wall doorway records on this room's own table. */
const ownDoorways = (roomIndex: number): DoorwayCandidate[] => {
  const out: DoorwayCandidate[] = [];
  for (const door of wasmGetRoomDoorInfo(roomIndex)) {
    if (door.nativeType === WARP_DOOR) continue;
    if (!(door.kind === 0 || door.isOpen)) continue;
    if (!outerWall(door.direction, door.row, door.col)) continue;
    const adj = ROOM_EDGE_ADJ[door.direction](roomIndex);
    if (adj === null) continue;
    out.push({
      edge: door.direction, pos: positionOn(door.direction, door),
      tile: { row: door.row, col: door.col }, adj, nativeType: door.nativeType,
    });
  }
  return out;
};

/** Doorway records held by a NEIGHBOUR, facing back into this room. */
const neighbourDoorways = (roomIndex: number): DoorwayCandidate[] => {
  const out: DoorwayCandidate[] = [];
  for (const edge of ['north', 'south', 'west', 'east'] as const) {
    const adj = ROOM_EDGE_ADJ[edge](roomIndex);
    if (adj === null) continue;
    for (const door of wasmGetRoomDoorInfo(adj)) {
      if (door.nativeType === WARP_DOOR) continue;
      if (!(door.kind === 0 || door.isOpen)) continue;
      if (door.direction !== OPPOSITE[edge]) continue;
      if (!outerWall(door.direction, door.row, door.col)) continue;
      const pos = positionOn(edge, door);
      // The neighbour's own way out to the overworld shares this encoding;
      // mirroring one invents a room-to-room link into solid wall.
      if (exitDoorAt(adj, door.direction, pos)) continue;
      out.push({ edge, pos, tile: exitFromEdge(edge, pos), adj, nativeType: door.nativeType });
    }
  }
  return out;
};

/**
 * One doorway per edge per neighbour REGION. Dropping the region qualifier
 * collapses two north doorways into the same room at columns 10 and 50 into one,
 * which is the ledge the sanctuary grounds lose when a wall's several separate
 * crossings are treated as interchangeable.
 */
const doorwayKey = (candidate: DoorwayCandidate): string =>
  `${candidate.edge}:${candidate.adj}${regionQualifier(entryFromEdge(candidate.edge, candidate.pos))}`;

/** Doorway objects through the outer walls, validated against the destination. */
const doorwayCrossings = (pass: CrossingPass): ScreenCrossing[] => {
  const roomIndex = pass.scope.roomIndex;
  const seen = new Set<string>();
  const out: ScreenCrossing[] = [];
  for (const candidate of [...ownDoorways(roomIndex), ...neighbourDoorways(roomIndex)]) {
    const key = doorwayKey(candidate);
    if (seen.has(key)) continue;
    if (exitDoorAt(roomIndex, candidate.edge, candidate.pos)) continue;
    if (!doorwayLandingOpen(candidate.adj, candidate.edge, candidate.pos)) continue;
    seen.add(key);
    out.push(makeCrossing(pass, {
      id: `doorway:${candidate.edge}:${candidate.pos}`,
      class: 'entrance',
      kind: 'door',
      origin: 'room-doorway',
      tile: doorCrossingTile({ ...candidate.tile, direction: candidate.edge }, pass.reachable, candidate.tile),
      side: candidate.edge,
      target: roomTarget(candidate.adj),
      edgeSig: `d${candidate.edge}:${candidate.pos}`,
      requirements: requirementsFor(candidate.nativeType),
    }));
  }
  return out;
};

export { warpCrossings, doorwayCrossings };
