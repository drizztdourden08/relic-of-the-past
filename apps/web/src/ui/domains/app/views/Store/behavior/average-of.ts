/* @layer renderer-components @kind logic */
import type { ItemStats } from '@shared/store/types';

const averageOf = (stats: ItemStats): number | null =>
  stats.ratingCount > 0 ? stats.ratingSum / stats.ratingCount : null;

export { averageOf };
