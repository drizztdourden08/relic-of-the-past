/* @layer bridge-wasm @kind logic */
/**
 * Which background layer a flood starts on. This was derived two different ways
 * — the widget/dumper trusted the live `wasmGetLinkLayer()`, the simulator ran a
 * stair/door/floor heuristic — and the engine's own flood derived it not at all,
 * silently falling back to layer 0. In a split-level room that made the flood
 * gating every chest/door/NPC target start on the wrong layer while the exit
 * flood started on the right one.
 *
 * One rule, most-authoritative signal first:
 *   1. the live layer bit, when the flood starts where the player actually stands
 *   2. arrival ON an inter-room stair — stairs deposit the player on their own layer
 *   3. arrival through a door — position slots 6-11 are the lower page, and the
 *      game keeps the player's level bit across a door transition
 *   4. only layer 1 has floor near the landing (a BG1 border strip)
 */
import type { GridPos } from '@shared/game/navigation';
import { isPassableAttr } from '@shared/game/navigation/tile-attrs';
import { wasmGetLinkLayer, wasmGetRoomDoorInfo, wasmGetRoomStairInfo, wasmGetRoomStairInfoFor } from '../';
import { isLoadedRoom } from './screen-grids';

/** How far from the start tile a door still counts as "the one the player came through". */
const DOOR_NEAR = 8;

interface StartLayerArgs {
  roomId: number;
  startPos?: GridPos;
  dualLayerGrids?: { layer0: number[][]; layer1: number[][] };
  /** True when the flood starts from the player's real position in the loaded room. */
  atPlayer?: boolean;
}

const nearestDoorLayer = (roomId: number, startPos: GridPos): 0 | 1 | undefined => {
  const dist = (d: { row: number; col: number }): number =>
    Math.abs(d.row - startPos.row) + Math.abs(d.col - startPos.col);
  const near = wasmGetRoomDoorInfo(roomId)
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
export type { StartLayerArgs };
