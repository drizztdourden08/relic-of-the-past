/* @layer store-site @kind logic */
import type { ListingEdit, StoreItem, StoreVersion } from '@shared/store/types';
import { formatDateTime } from '@site-kit/lib/format-date';
import { formatCount } from '../../lib/format-count/format-count';
import { chipStateOf } from '../version-file/chip-state-of';
import { fileLineOf } from '../version-file/file-line-of';
import type { PublicationRow } from './publication-row.type';
import { DASH } from './publication-row.constants';
import { rowId } from './row-id';

const dateOr = (ms: number | null) => (ms === null ? DASH : formatDateTime(ms));

const itemFields = (item: StoreItem) => ({ itemId: item.id, item: item.name, kind: item.kind });

const versionRow = (item: StoreItem, v: StoreVersion, now: number): PublicationRow => ({
  ...itemFields(item),
  id: rowId(item.id, { kind: 'version', n: v.n }),
  entry: `v${v.n}${v.n === item.liveVersion ? ' · live' : ''}`,
  semver: v.semver,
  review: chipStateOf(v),
  file: fileLineOf(item, v, now),
  submitted: dateOr(v.review.submittedAt),
  reviewedBy: v.review.by?.displayName ?? DASH,
  reviewedAt: dateOr(v.review.decidedAt),
  note: v.review.note || DASH,
  installs: v.n === item.liveVersion ? formatCount(item.stats.installs) : DASH,
});

const editRow = (item: StoreItem, edit: ListingEdit): PublicationRow => ({
  ...itemFields(item),
  id: rowId(item.id, { kind: 'listing', editId: edit.id }),
  entry: `listing edit · ${Object.keys(edit.patch).join(', ')}`,
  semver: DASH,
  review: edit.review.state,
  file: DASH,
  submitted: dateOr(edit.review.submittedAt),
  reviewedBy: edit.review.by?.displayName ?? DASH,
  reviewedAt: dateOr(edit.review.decidedAt),
  note: edit.review.note || DASH,
  installs: DASH,
});

const draftRow = (item: StoreItem): PublicationRow => ({
  ...itemFields(item),
  id: rowId(item.id, { kind: 'none' }),
  entry: 'no version yet',
  semver: DASH,
  review: 'draft',
  file: DASH,
  submitted: DASH,
  reviewedBy: DASH,
  reviewedAt: DASH,
  note: DASH,
  installs: DASH,
});

const rowsOfItem = (item: StoreItem, now: number): PublicationRow[] => {
  const versions = [...item.versions].reverse().map((v) => versionRow(item, v, now));
  const edits = [...item.listingEdits].reverse().map((edit) => editRow(item, edit));
  const rows = [...versions, ...edits];
  return rows.length ? rows : [draftRow(item)];
};

export { rowsOfItem };
