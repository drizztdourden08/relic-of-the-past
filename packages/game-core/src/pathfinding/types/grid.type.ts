/* @layer shared-game @kind types */
type ReachState = number;

type LedgeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

type TilePassability =
  | { type: 'free' }
  | { type: 'obstacle'; req: string }
  | { type: 'blocked' }
  | { type: 'ledge'; dir: LedgeDir }
  | { type: 'stairs' }
  | { type: 'pit' }
  | { type: 'water' };

interface GridPos {
  row: number;
  col: number;
}

interface WorldPos {
  screen: number;
  row: number;
  col: number;
}

interface CollisionGrid {
  tiles: TilePassability[][];
  rawAttr: number[][];
}

interface Map32Tables {
  t0: Buffer; t1: Buffer; t2: Buffer; t3: Buffer;
}

export type { CollisionGrid, GridPos, LedgeDir, Map32Tables, ReachState, TilePassability, WorldPos };
