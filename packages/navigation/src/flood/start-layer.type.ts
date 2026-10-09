/* @layer bridge-wasm @kind types */
import type { GridPos } from '@rotp/game-core';

interface StartLayerArgs {
  roomId: number;
  startPos?: GridPos;
  dualLayerGrids?: { layer0: number[][]; layer1: number[][] };
  atPlayer?: boolean;
}

export type { StartLayerArgs };
