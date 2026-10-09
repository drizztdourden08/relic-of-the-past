/* @layer store-site @kind logic */
import type { ReactNode } from 'react';
import type { Review } from '@shared/store/review-types';
import type { ListingEdit, StoreItem, StoreVersion } from '@shared/store/types';
import type { DetailField } from '@site-kit/components/DetailPane/DetailPane';
import { formatBytes } from '@site-kit/lib/format-bytes';
import { formatDateTime } from '@site-kit/lib/format-date';
import { Chip } from '@site-kit/components/Chip/Chip';
import { ReviewChip } from '../../../../components/ReviewChip/ReviewChip';
import type { ReviewChipState } from '../../../../components/ReviewChip/ReviewChip';
import { factsLine } from '../../../../catalog/facts-line';
import type { PublicationTarget } from '../../../../publications/publication-row';
import { chipStateOf, fileLineOf } from '../../../../publications/version-file';
import { entryOf } from './entry-of';
import { SHA_EDGE } from './publication-detail.constants';

const reviewFields = (state: ReviewChipState, review: Review<string>): DetailField[] => [
  { label: 'state', value: <ReviewChip state={state} /> },
  { label: 'submitted', value: review.submittedAt ? formatDateTime(review.submittedAt) : '-' },
  { label: 'reviewed by', value: review.by?.displayName ?? 'not yet' },
  { label: 'reviewed at', value: review.decidedAt ? formatDateTime(review.decidedAt) : '-' },
];

const versionFields = (item: StoreItem, v: StoreVersion, now: number): DetailField[] => [
  { label: 'file', value: v.name },
  { label: 'kept', value: fileLineOf(item, v, now) },
  { label: 'size', value: [formatBytes(v.bytes), factsLine(v.facts)].filter(Boolean).join(' · ') },
  { label: 'sha256', value: v.sha256 ? `${v.sha256.slice(0, SHA_EDGE)}...${v.sha256.slice(-SHA_EDGE)}` : '-' },
];

const changedFields = (edit: ListingEdit): ReactNode => Object.keys(edit.patch).map((key) => <Chip key={key}>{key}</Chip>);

const detailFieldsOf = (item: StoreItem, target: PublicationTarget, now: number): DetailField[] => {
  const { version, edit } = entryOf(item, target);
  const head: DetailField = { label: 'item', value: item.name };
  if (version) return [head, ...reviewFields(chipStateOf(version), version.review), ...versionFields(item, version, now)];
  if (edit) return [head, ...reviewFields(edit.review.state, edit.review), { label: 'changes', value: changedFields(edit) }];
  return [head, { label: 'status', value: <Chip tone="muted">draft</Chip> }, { label: 'next', value: 'Upload a first version to send it to review.' }];
};

export { detailFieldsOf };
