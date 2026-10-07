/* @layer renderer-components @kind logic */
/** The facts the detail panel reads off a full item: its live version and its average rating. */
import type { ItemStats, StoreItem, StoreVersion } from '@shared/store/types';

const liveVersionOf = (item: StoreItem): StoreVersion | null =>
  item.versions.find((version) => version.n === item.liveVersion) ?? null;

const averageOf = (stats: ItemStats): number | null =>
  stats.ratingCount > 0 ? stats.ratingSum / stats.ratingCount : null;

export { liveVersionOf, averageOf };
