/* @layer store-api @kind logic */
import type { ReviewEntry, StoreItem } from '@rotp/hub-contracts';

const readyEntries = (item: StoreItem): ReviewEntry[] =>
  item.versions
    .filter((version) => version.review.state === 'ready' && !version.removed)
    .map((version): ReviewEntry => ({ item, target: { kind: 'version', n: version.n }, submittedAt: version.createdAt }));

const unsubmittedOf = (items: StoreItem[]): ReviewEntry[] =>
  items.flatMap(readyEntries).sort((a, b) => a.submittedAt - b.submittedAt);

export { unsubmittedOf };
