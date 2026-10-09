/* @layer bridge-wasm @kind types */
type GridCell = { row: number; col: number };

type DualLayerGrids = { layer0: number[][]; layer1: number[][]; stairTiles: Array<GridCell> };

type ToggleFloorPosition = { pos: number; row: number; col: number };

export type { DualLayerGrids, GridCell, ToggleFloorPosition };
