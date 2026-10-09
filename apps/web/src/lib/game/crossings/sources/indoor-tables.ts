/* @layer bridge-wasm @kind logic */
import type { ScreenCrossing } from '@shared/game/navigation';
import {
  wasmGetRoomDoorInfo, wasmGetRoomStairInfo, wasmGetRoomStairInfoFor,
  wasmGetRoomWalkBoundaries, wasmGetRoomWalkBoundariesFor,
} from '../../';
import { readMapState } from '../../simulator/read-game-state';
import { isFollowerActive } from '../../follower-state';
import { BOUNDARY_ID_BASE, STAIR_ID_BASE } from '../../flood/room-entrances';
import { roomTarget } from '../resolve-target';
import { makeCrossing } from '../make-crossing';
import type { CrossingPass } from '../crossings.type';
import { FOLLOWER_REQ, THRONE_DOOR } from './indoor-tables.constants';

const isLoaded = (roomIndex: number): boolean => {
  const live = readMapState();
  return live?.isIndoors === true && live.roomIndex === roomIndex;
};

const stairCrossings = (pass: CrossingPass): ScreenCrossing[] => {
  const roomIndex = pass.scope.roomIndex;
  const stairs = isLoaded(roomIndex) ? wasmGetRoomStairInfo() : wasmGetRoomStairInfoFor(roomIndex);
  const out: ScreenCrossing[] = [];
  for (let i = 0; i < stairs.length; i++) {
    const stair = stairs[i];
    if (stair.destRoom === 0) continue;
    out.push(makeCrossing(pass, {
      id: `stair:${STAIR_ID_BASE + i}`,
      class: 'entrance',
      kind: 'stairs',
      origin: 'room-stair',
      tile: { row: stair.row, col: stair.col },
      side: stair.direction,
      layer: stair.layer,
      target: roomTarget(stair.destRoom),
      edgeSig: `s${STAIR_ID_BASE + i}`,
    }));
  }
  return out;
};

const followerGated = (roomIndex: number): boolean =>
  (wasmGetRoomDoorInfo(roomIndex) ?? []).some((door) => door.nativeType === THRONE_DOOR) && !isFollowerActive();

const boundaryCrossings = (pass: CrossingPass): ScreenCrossing[] => {
  const roomIndex = pass.scope.roomIndex;
  const bounds = isLoaded(roomIndex) ? wasmGetRoomWalkBoundaries() : wasmGetRoomWalkBoundariesFor(roomIndex);
  if (bounds.length === 0) return [];
  const requirements = followerGated(roomIndex) ? [FOLLOWER_REQ] : [];
  const out: ScreenCrossing[] = [];
  for (let i = 0; i < bounds.length; i++) {
    const bound = bounds[i];
    if (bound.destRoom === 0) continue;
    out.push(makeCrossing(pass, {
      id: `bound:${BOUNDARY_ID_BASE + i}`,
      class: 'entrance',
      kind: 'door',
      origin: 'room-border',
      tile: { row: bound.row, col: bound.col },
      target: roomTarget(bound.destRoom),
      edgeSig: `s${BOUNDARY_ID_BASE + i}`,
      requirements,
    }));
  }
  return out;
};

const indoorTableCrossings = (pass: CrossingPass): ScreenCrossing[] =>
  [...stairCrossings(pass), ...boundaryCrossings(pass)];

export { indoorTableCrossings };
