/* @layer bridge-wasm @kind logic */
import type { OverworldEntrance } from '@shared/game/navigation';
import {
  wasmGetRoomStairInfo, wasmGetRoomStairInfoFor, wasmGetRoomWalkBoundaries,
  wasmGetRoomWalkBoundariesFor, wasmGetRoomDoorInfo,
} from '../../';
import { isFollowerActive } from '@rotp/game-core';
import { BOUNDARY_ID_BASE, STAIR_ID_BASE, THRONE_DOOR } from './room-entrances.constants';

const stairEntrances = (roomId: number, isLive: boolean): OverworldEntrance[] => {
  const stairs = isLive ? wasmGetRoomStairInfo() : wasmGetRoomStairInfoFor(roomId);
  const out: OverworldEntrance[] = [];
  for (let i = 0; i < stairs.length; i++) {
    if (stairs[i].destRoom === 0) continue;
    out.push({ area: roomId, pos: 0, id: STAIR_ID_BASE + i, gridRow: stairs[i].row, gridCol: stairs[i].col, roomId: stairs[i].destRoom });
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
  for (let i = 0; i < bounds.length; i++) {
    if (bounds[i].destRoom === 0) continue;
    out.push({ area: roomId, pos: 0, id: BOUNDARY_ID_BASE + i, gridRow: bounds[i].row, gridCol: bounds[i].col, roomId: bounds[i].destRoom });
  }
  return out;
};

const tableEntrances = (roomId: number, isLive: boolean): OverworldEntrance[] =>
  [...stairEntrances(roomId, isLive), ...boundaryEntrances(roomId, isLive)];

export { tableEntrances };
