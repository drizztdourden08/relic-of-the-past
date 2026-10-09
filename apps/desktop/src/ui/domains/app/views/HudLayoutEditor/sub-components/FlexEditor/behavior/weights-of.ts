/* @layer renderer-components @kind logic */
import type { FlexCell } from '../sub-components/FlexStrip.type';

const weightsOf = (cells: readonly FlexCell[]): number[] => {
  const total = cells.reduce((sum, cell) => sum + Math.max(cell.weight, 0), 0);
  return cells.map((cell) => (total > 0 ? Math.max(cell.weight, 0) : 1));
};

export { weightsOf };
