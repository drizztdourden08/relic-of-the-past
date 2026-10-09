/* @layer bridge-wasm @kind types */
import type { ConnectionInfo } from '@rotp/game-core';

type EdgeSide = ConnectionInfo['edge'];

interface TogglePosition {
  row: number;
  col: number;
}

export type { EdgeSide, TogglePosition };
