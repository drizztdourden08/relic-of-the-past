/* @layer renderer-components @kind logic */
import type { StoreItem, StoreVersion } from '@rotp/hub-contracts';

const liveVersionOf = (item: StoreItem): StoreVersion | null =>
  item.versions.find((version) => version.n === item.liveVersion) ?? null;

export { liveVersionOf };
