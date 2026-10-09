/* @layer bridge-wasm @kind logic */
import type { ScreenCrossing } from '@rotp/game-core';
import { wasmGetRoomDoorInfo, wasmGetRoomTravelDestinationsFor } from '@rotp/game-core';
import { doorCrossingTile } from '../../place-tile';
import { roomTarget } from '../../resolve-target';
import { makeCrossing } from '../../make-crossing';
import type { CrossingPass } from '../../crossings.type';
import { WARP_DOOR, WARP_SLOT, WARP_SLOTS } from './indoor-doors.constants';

const warpCrossings = (pass: CrossingPass): ScreenCrossing[] => {
  const roomIndex = pass.scope.roomIndex;
  const doors = (wasmGetRoomDoorInfo(roomIndex) ?? []).filter((door) => door.nativeType === WARP_DOOR);
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

export { warpCrossings };
