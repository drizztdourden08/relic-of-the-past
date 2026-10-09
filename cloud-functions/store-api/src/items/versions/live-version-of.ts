/* @layer store-api @kind logic */
import type { StoreItem, StoreVersion } from '@rotp/hub-contracts';
import { versionOf } from './version-of';

const liveVersionOf = (item: Pick<StoreItem, 'versions' | 'liveVersion'>): StoreVersion | null =>
  (item.liveVersion === null ? null : versionOf(item, item.liveVersion));

export { liveVersionOf };
