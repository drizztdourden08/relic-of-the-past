/* @layer renderer-components @kind logic */
import type { CheckCounts } from './run-progress.type';

const percentOf = (counts: CheckCounts): number =>
  (counts.total > 0 ? Math.round((counts.taken / counts.total) * 100) : 0);

export { percentOf };
