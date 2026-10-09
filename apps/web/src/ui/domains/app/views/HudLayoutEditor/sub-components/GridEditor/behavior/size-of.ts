/* @layer renderer-components @kind logic */
import type { CellBounds } from '../../GridLattice';

const sizeOf = (bounds: CellBounds): string =>
  `${bounds.c1 - bounds.c0 + 1} × ${bounds.r1 - bounds.r0 + 1}`;

export { sizeOf };
