/* @layer store-api @kind logic */
/** The review queue from the items that wait: one entry per waiting version and per waiting
 *  listing edit, oldest submission first. A target reads `v<n>` for a version and the edit's
 *  own id for a listing edit, which is the `:target` segment of the decide route. */
import type { ReviewEntry, ReviewTarget } from '../../../../shared/store/api-types';
import type { StoreItem } from '../../../../shared/store/types';

const VERSION_TARGET = /^v([1-9][0-9]{0,6})$/;

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

/** The `:target` segment as a version or a listing edit. */
const parseTarget = (raw: string): ReviewTarget => {
  const match = VERSION_TARGET.exec(raw);
  return match ? { kind: 'version', n: Number(match[1]) } : { kind: 'listing', editId: raw };
};

const formatTarget = (target: ReviewTarget): string => (target.kind === 'version' ? `v${target.n}` : target.editId);

export { queueOf, parseTarget, formatTarget };
