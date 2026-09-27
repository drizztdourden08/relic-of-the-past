/* @layer store-site @kind logic */
/**
 * The rows of My publications: one per version and one per listing edit of every item the
 * player published, newest first within an item, grouped by the item's name. A draft with
 * nothing uploaded yet still gets one row, so it can be found and finished. Dates read as
 * sortable text; the reviewer and the note are the author's own to see.
 */
import type { ListingEdit, StoreItem, StoreKind, StoreVersion } from '@shared/store/types';
import { formatDateTime } from '@site-kit/lib/format-date';
import { formatCount } from '../lib/format-count';

type PublicationTarget = { kind: 'version'; n: number } | { kind: 'listing'; editId: string } | { kind: 'none' };

type PublicationRow = {
  id: string;
  itemId: string;
  item: string;
  entry: string;
  kind: StoreKind;
  semver: string;
  review: string;
  submitted: string;
  reviewedBy: string;
  reviewedAt: string;
  note: string;
  installs: string;
};

const SEP = '~';
const DASH = '-';

const dateOr = (ms: number | null) => (ms === null ? DASH : formatDateTime(ms));

const rowId = (itemId: string, target: PublicationTarget): string => {
  if (target.kind === 'version') return `${itemId}${SEP}v${target.n}`;
  if (target.kind === 'listing') return `${itemId}${SEP}${target.editId}`;
  return `${itemId}${SEP}item`;
};

const parseRowId = (id: string): { itemId: string; target: PublicationTarget } | null => {
  const at = id.lastIndexOf(SEP);
  if (at <= 0) return null;
  const itemId = id.slice(0, at);
  const rest = id.slice(at + 1);
  if (rest === 'item') return { itemId, target: { kind: 'none' } };
  const version = /^v(\d+)$/.exec(rest);
  return { itemId, target: version ? { kind: 'version', n: Number(version[1]) } : { kind: 'listing', editId: rest } };
};

const versionRow = (item: StoreItem, v: StoreVersion): PublicationRow => ({
  id: rowId(item.id, { kind: 'version', n: v.n }),
  itemId: item.id,
  item: item.name,
  entry: `v${v.n}${v.n === item.liveVersion ? ' · live' : ''}`,
  kind: item.kind,
  semver: v.semver,
  review: v.review.state,
  submitted: dateOr(v.review.submittedAt),
  reviewedBy: v.review.by?.displayName ?? DASH,
  reviewedAt: dateOr(v.review.decidedAt),
  note: v.review.note || DASH,
  installs: v.n === item.liveVersion ? formatCount(item.stats.installs) : DASH,
});

const editRow = (item: StoreItem, edit: ListingEdit): PublicationRow => ({
  id: rowId(item.id, { kind: 'listing', editId: edit.id }),
  itemId: item.id,
  item: item.name,
  entry: `listing edit · ${Object.keys(edit.patch).join(', ')}`,
  kind: item.kind,
  semver: DASH,
  review: edit.review.state,
  submitted: dateOr(edit.review.submittedAt),
  reviewedBy: edit.review.by?.displayName ?? DASH,
  reviewedAt: dateOr(edit.review.decidedAt),
  note: edit.review.note || DASH,
  installs: DASH,
});

const draftRow = (item: StoreItem): PublicationRow => ({
  ...editRow(item, { id: 'item', patch: {}, review: { state: 'uploading', submittedAt: null, decidedAt: null, by: null, note: '' } }),
  id: rowId(item.id, { kind: 'none' }),
  entry: 'no version yet',
  review: 'draft',
});

const rowsOfItem = (item: StoreItem): PublicationRow[] => {
  const versions = [...item.versions].reverse().map((v) => versionRow(item, v));
  const edits = [...item.listingEdits].reverse().map((edit) => editRow(item, edit));
  const rows = [...versions, ...edits];
  return rows.length ? rows : [draftRow(item)];
};

const publicationRowId = (row: PublicationRow) => row.id;

export { rowsOfItem, rowId, parseRowId, publicationRowId };
export type { PublicationRow, PublicationTarget };
