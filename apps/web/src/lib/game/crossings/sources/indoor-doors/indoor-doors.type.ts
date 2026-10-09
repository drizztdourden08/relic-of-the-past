/* @layer bridge-wasm @kind types */
import type { EdgeName } from '../../../simulator/exit-order';

interface DoorwayCandidate {
  edge: EdgeName;
  pos: number;
  tile: { row: number; col: number };
  adj: number;
  nativeType: number;
}

export type { DoorwayCandidate };
