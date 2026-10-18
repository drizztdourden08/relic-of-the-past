/* @layer renderer-app @kind logic */
import type { TableOrder } from '../DataInspector.type';

const sameOrder = (a: TableOrder, b: TableOrder): boolean =>
  JSON.stringify([a.sort, a.groupBy]) === JSON.stringify([b.sort, b.groupBy]);

export { sameOrder };
