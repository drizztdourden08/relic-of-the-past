/* @layer bridge-wasm @kind logic */
import type { BlockedSpot } from './usable-crossings.type';
import type { EdgeName } from '../simulator/exit-order';
import { wasmGetRoomDoorInfo } from '../wasm-bridge';
import { isFollowerActive } from '../follower-state';
import { THRONE_DOOR, WARP_DOOR } from './usable-crossings.constants';

const blockedSpots = (roomIndex: number): BlockedSpot[] => {
  const follower = isFollowerActive();
  return (wasmGetRoomDoorInfo(roomIndex) ?? [])
    .filter((door) => door.nativeType === WARP_DOOR || (door.nativeType === THRONE_DOOR && !follower))
    .map((door) => ({
      edge: door.direction as EdgeName,
      pos: door.direction === 'north' || door.direction === 'south' ? door.col : door.row,
    }));
};

export { blockedSpots };
