/* @layer store-api @kind logic */
/** The versions uploaded and checked that no author has sent for review yet: one entry per
 *  ready version whose file is still kept, oldest upload first. They sit outside the approval
 *  queue; a reviewer can only reject or delete them. */
import type { ReviewEntry } from '../../../../shared/store/api-types';
import type { StoreItem } from '../../../../shared/store/types';

const readyEntries = (item: StoreItem): ReviewEntry[] =>
  item.versions
    .filter((version) => version.review.state === 'ready' && !version.removed)
    .map((version): ReviewEntry => ({ item, target: { kind: 'version', n: version.n }, submittedAt: version.createdAt }));

const unsubmittedOf = (items: StoreItem[]): ReviewEntry[] =>
  items.flatMap(readyEntries).sort((a, b) => a.submittedAt - b.submittedAt);

export { unsubmittedOf };
