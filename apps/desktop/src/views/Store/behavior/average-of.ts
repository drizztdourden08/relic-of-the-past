/* @layer renderer-components @kind logic */
import type { ItemStats } from '@rotp/hub-contracts';

const averageOf = (stats: ItemStats): number | null =>
  stats.ratingCount > 0 ? stats.ratingSum / stats.ratingCount : null;

export { averageOf };
