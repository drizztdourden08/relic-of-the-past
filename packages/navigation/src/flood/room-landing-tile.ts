/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@rotp/game-core';
import { wasmGetRoomStairInfoFor, wasmGetRoomWalkBoundariesFor } from '@rotp/game-core';

const roomLandingTile = (destRoom: number, fromRoom: number): GridPos | undefined => {
  const back = wasmGetRoomStairInfoFor(destRoom).find((s) => s.destRoom === fromRoom)
    ?? wasmGetRoomWalkBoundariesFor(destRoom).find((b) => b.destRoom === fromRoom);
  return back ? { row: back.row, col: back.col } : undefined;
};

export { roomLandingTile };
