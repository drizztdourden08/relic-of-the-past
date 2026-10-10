/* @layer tests @kind helper */
import { required } from '../../required';

const rowOf = <T>(grid: readonly T[][], row: number): T[] => required(grid[row], `grid row ${row}`);

const cellOf = <T>(grid: readonly (readonly T[])[], row: number, col: number): T =>
  required(required(grid[row], `grid row ${row}`)[col], `grid cell ${row},${col}`);

export { cellOf, rowOf };
