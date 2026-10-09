/* @layer bridge-wasm @kind types */
interface SpawnRow {
  id: number;
  tile: { row: number; col: number };
  layer: 0 | 1;
  doorArea?: number;
  holeArea?: number;
}

interface SpawnAreas {
  door: Map<number, number>;
  hole: Map<number, number>;
}

export type { SpawnRow, SpawnAreas };
