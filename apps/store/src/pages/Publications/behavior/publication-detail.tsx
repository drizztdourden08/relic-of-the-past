/* @layer store-site @kind logic */
/**
 * What the detail pane of My publications shows for one row: the version or the listing
 * edit it stands for, its title, and its fields with the full review record.
 */
import type { ReactNode } from 'react';
import type { Review } from '@shared/store/review-types';
import type { ListingEdit, StoreItem, StoreVersion } from '@shared/store/types';
import type { DetailField } from '@site-kit/components/DetailPane/DetailPane';
import { formatBytes } from '@site-kit/lib/format-bytes';
import { formatDateTime } from '@site-kit/lib/format-date';
import { Chip } from '@site-kit/components/Chip/Chip';
import { ReviewChip } from '../../../components/ReviewChip/ReviewChip';
import { factsLine } from '../../../catalog/facts-line';
import type { PublicationTarget } from '../../../publications/publication-row';

type Entry = { version: StoreVersion | null; edit: ListingEdit | null };

const SHA_EDGE = 4;

const entryOf = (item: StoreItem, target: PublicationTarget): Entry => ({
  version: target.kind === 'version' ? item.versions.find((v) => v.n === target.n) ?? null : null,
  edit: target.kind === 'listing' ? item.listingEdits.find((e) => e.id === target.editId) ?? null : null,
});

const detailTitleOf = (item: StoreItem, target: PublicationTarget): string => {
  const { version } = entryOf(item, target);
  if (version) return `v${version.n} · ${version.semver}`;
  return target.kind === 'listing' ? 'Listing edit' : item.name;
};

const reviewFields = (review: Review): DetailField[] => [
  { label: 'review', value: <ReviewChip state={review.state} /> },
  { label: 'submitted', value: review.submittedAt ? formatDateTime(review.submittedAt) : '-' },
  { label: 'reviewed by', value: review.by?.displayName ?? 'not yet' },
  { label: 'reviewed at', value: review.decidedAt ? formatDateTime(review.decidedAt) : '-' },
];

const versionFields = (v: StoreVersion): DetailField[] => [
  { label: 'file', value: v.name },
  { label: 'size', value: [formatBytes(v.bytes), factsLine(v.facts)].filter(Boolean).join(' · ') },
  { label: 'sha256', value: v.sha256 ? `${v.sha256.slice(0, SHA_EDGE)}...${v.sha256.slice(-SHA_EDGE)}` : '-' },
];

const changedFields = (edit: ListingEdit): ReactNode => Object.keys(edit.patch).map((key) => <Chip key={key}>{key}</Chip>);

const detailFieldsOf = (item: StoreItem, target: PublicationTarget): DetailField[] => {
  const { version, edit } = entryOf(item, target);
  const head: DetailField = { label: 'item', value: item.name };
  if (version) return [head, ...reviewFields(version.review), ...versionFields(version)];
  if (edit) return [head, ...reviewFields(edit.review), { label: 'changes', value: changedFields(edit) }];
  return [head, { label: 'status', value: <Chip tone="muted">draft</Chip> }, { label: 'next', value: 'Upload a first version to send it to review.' }];
};

export { entryOf, detailTitleOf, detailFieldsOf };
