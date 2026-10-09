/* @layer bridge-wasm @kind types */
import type { ConnectionInfo } from '@shared/game/navigation';

type EdgeSide = ConnectionInfo['edge'];

interface TogglePosition {
  row: number;
  col: number;
}

export type { EdgeSide, TogglePosition };
