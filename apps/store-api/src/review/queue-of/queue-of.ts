/* @layer store-api @kind logic */
import type { ReviewEntry, StoreItem } from '@rotp/hub-contracts';

const versionEntries = (item: StoreItem): ReviewEntry[] =>
  item.versions
    .filter((version) => version.review.state === 'waiting')
    .map((version): ReviewEntry => ({ item, target: { kind: 'version', n: version.n }, submittedAt: version.review.submittedAt ?? version.createdAt }));

const editEntries = (item: StoreItem): ReviewEntry[] =>
  item.listingEdits
    .filter((edit) => edit.review.state === 'waiting')
    .map((edit): ReviewEntry => ({ item, target: { kind: 'listing', editId: edit.id }, submittedAt: edit.review.submittedAt ?? item.updatedAt }));

const queueOf = (items: StoreItem[]): ReviewEntry[] =>
  items.flatMap((item) => [...versionEntries(item), ...editEntries(item)]).sort((a, b) => a.submittedAt - b.submittedAt);

export { queueOf };
