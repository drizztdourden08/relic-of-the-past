/* @layer renderer-components @kind logic */
import type { GridPos } from '../navigation-overlay.type';

const keyOf = (pos: GridPos): string => {
  return `${pos.row},${pos.col}`;
};

export { keyOf };
