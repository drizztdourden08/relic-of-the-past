/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@shared/game/navigation';
import { isPassableAttr } from '@shared/game/navigation/tile-attrs';
import { wasmGetLinkLayer, wasmGetRoomDoorInfo, wasmGetRoomStairInfo, wasmGetRoomStairInfoFor } from '../';
import { isLoadedRoom } from './is-loaded-room';
import { DOOR_NEAR } from './start-layer.constants';
import type { StartLayerArgs } from './start-layer.type';

const nearestDoorLayer = (roomId: number, startPos: GridPos): 0 | 1 | undefined => {
  const dist = (d: { row: number; col: number }): number =>
    Math.abs(d.row - startPos.row) + Math.abs(d.col - startPos.col);
  const near = (wasmGetRoomDoorInfo(roomId) ?? [])
    .filter((d) => Math.abs(d.row - startPos.row) <= DOOR_NEAR && Math.abs(d.col - startPos.col) <= DOOR_NEAR)
    .sort((a, b) => dist(a) - dist(b))[0];
  return near?.layer;
};

const onlyLayer1HasFloor = (grids: { layer0: number[][]; layer1: number[][] }, startPos: GridPos): boolean => {
  const near = (g: number[][]): boolean => {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (isPassableAttr(g[startPos.row + dr]?.[startPos.col + dc] ?? 1)) return true;
      }
    }
    return false;
  };
  return !near(grids.layer0) && near(grids.layer1);
};

const deriveStartLayer = (args: StartLayerArgs): 0 | 1 | undefined => {
  const { roomId, startPos, dualLayerGrids, atPlayer } = args;
  if (!dualLayerGrids) return undefined;
  if (atPlayer && isLoadedRoom(roomId)) return wasmGetLinkLayer() ?? undefined;
  if (!startPos) return undefined;

  const stairs = isLoadedRoom(roomId) ? wasmGetRoomStairInfo() : wasmGetRoomStairInfoFor(roomId);
  const atStair = stairs.find((st) => Math.abs(st.row - startPos.row) <= 1 && Math.abs(st.col - startPos.col) <= 1);
  if (atStair) return atStair.layer;

  const doorLayer = nearestDoorLayer(roomId, startPos);
  if (doorLayer !== undefined) return doorLayer;

  return onlyLayer1HasFloor(dualLayerGrids, startPos) ? 1 : undefined;
};

export { deriveStartLayer };
export type { StartLayerArgs } from './start-layer.type';
