/* @layer bridge-wasm @kind logic */
import type { OverworldEntrance } from '@rotp/game-core';
import { wasmGetRoomStairInfo, wasmGetRoomStairInfoFor, wasmGetRoomWalkBoundaries, wasmGetRoomWalkBoundariesFor, wasmGetRoomDoorInfo, isFollowerActive } from '@rotp/game-core';
import { BOUNDARY_ID_BASE, STAIR_ID_BASE, THRONE_DOOR } from './room-entrances.constants';

const stairEntrances = (roomId: number, isLive: boolean): OverworldEntrance[] => {
  const stairs = isLive ? wasmGetRoomStairInfo() : wasmGetRoomStairInfoFor(roomId);
  const out: OverworldEntrance[] = [];
  for (const [i, stair] of stairs.entries()) {
    if (stair.destRoom === 0) continue;
    out.push({ area: roomId, pos: 0, id: STAIR_ID_BASE + i, gridRow: stair.row, gridCol: stair.col, roomId: stair.destRoom });
  }
  return out;
};

const boundaryEntrances = (roomId: number, isLive: boolean): OverworldEntrance[] => {
  const bounds = isLive ? wasmGetRoomWalkBoundaries() : wasmGetRoomWalkBoundariesFor(roomId);
  const followerGated = bounds.length > 0
    && (wasmGetRoomDoorInfo(roomId) ?? []).some((d) => d.nativeType === THRONE_DOOR)
    && !isFollowerActive();
  if (followerGated) return [];
  const out: OverworldEntrance[] = [];
  for (const [i, bound] of bounds.entries()) {
    if (bound.destRoom === 0) continue;
    out.push({ area: roomId, pos: 0, id: BOUNDARY_ID_BASE + i, gridRow: bound.row, gridCol: bound.col, roomId: bound.destRoom });
  }
  return out;
};

const tableEntrances = (roomId: number, isLive: boolean): OverworldEntrance[] =>
  [...stairEntrances(roomId, isLive), ...boundaryEntrances(roomId, isLive)];

export { tableEntrances };
