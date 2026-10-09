/* @layer bridge-wasm @kind types */
import type { GridPos } from '@shared/game/navigation';

type DoorSide = 'north' | 'south' | 'east' | 'west';

interface DoorRecord {
  row: number;
  col: number;
  direction: DoorSide;
}

interface SpawnCandidate<K> {
  key: K;
  tile: GridPos;
}

interface Landing {
  tile: GridPos;
  inward: number;
  lateral: number;
}

export type { DoorSide, DoorRecord, SpawnCandidate, Landing };
