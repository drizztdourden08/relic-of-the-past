/* @layer renderer-components @kind logic */
import type { CellBounds, CellRef } from './lattice-geometry.type';

const boundsOf = (cells: readonly CellRef[]): CellBounds => ({
  c0: Math.min(...cells.map((c) => c.column)),
  c1: Math.max(...cells.map((c) => c.column)),
  r0: Math.min(...cells.map((c) => c.row)),
  r1: Math.max(...cells.map((c) => c.row)),
});

export { boundsOf };
