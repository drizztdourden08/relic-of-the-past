/* @layer store-site @kind logic */
/**
 * The rows of the review page: one per waiting version or listing edit, or per version not
 * submitted yet, oldest first as the API sends them. A version of an item with nothing approved yet is a new item; a later
 * one is an update. Dates read as sortable text.
 */
import type { ReviewEntry } from '@shared/store/api-types';
import type { StoreKind } from '@shared/store/types';
import { formatBytes } from '@site-kit/lib/format-bytes';
import { formatDateTime } from '@site-kit/lib/format-date';
import { reviewTargetParam } from '../api/review-endpoints';

type ReviewRow = {
  id: string;
  item: string;
  kind: StoreKind;
  change: 'new item' | 'update' | 'listing edit';
  author: string;
  size: string;
  submitted: string;
};

const SEP = '~';

const entryId = (entry: ReviewEntry): string => `${entry.item.id}${SEP}${reviewTargetParam(entry.target)}`;

const versionOfEntry = (entry: ReviewEntry) => {
  const { item, target } = entry;
  return target.kind === 'version' ? item.versions.find((v) => v.n === target.n) ?? null : null;
};

const editOfEntry = (entry: ReviewEntry) => {
  const { item, target } = entry;
  return target.kind === 'listing' ? item.listingEdits.find((edit) => edit.id === target.editId) ?? null : null;
};

const toReviewRow = (entry: ReviewEntry): ReviewRow => {
  const { item, target } = entry;
  const version = versionOfEntry(entry);
  const label = version ? `${item.name} · ${version.semver}` : `${item.name} · listing`;
  const change = target.kind === 'listing' ? 'listing edit' : item.liveVersion === null ? 'new item' : 'update';
  return {
    id: entryId(entry),
    item: label,
    kind: item.kind,
    change,
    author: item.author.displayName,
    size: version ? formatBytes(version.bytes) : '-',
    submitted: formatDateTime(entry.submittedAt),
  };
};

const reviewRowId = (row: ReviewRow) => row.id;

export { toReviewRow, reviewRowId, entryId, versionOfEntry, editOfEntry };
export type { ReviewRow };
