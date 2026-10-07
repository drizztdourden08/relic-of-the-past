/* @layer store-api @kind logic */
/** A reviewer's decision written onto the item, one pure change per outcome. Each reads the
 *  latest record inside the item's transaction, so two reviewers cannot both decide it. A
 *  version is held to the version flow table: approve from waiting, reject from waiting or
 *  ready. A listing edit must still be waiting. Approving a version moves liveVersion to the
 *  newest approved one and publishes the item on its first approval. */
import type { ListingEditState, Review } from '../../../../shared/store/review-types';
import type { ListingEdit, Person, StoreItem, StoreVersion } from '../../../../shared/store/types';
import type { Actor } from '../../../../shared/store/version-flow';
import { conflict, notFound } from '../../../hub-core/http/http-error';
import type { ItemPatch } from '../db/items-repo';
import { moveVersion } from './move-version';
import { versionOf } from './versions';

type Decided = { by: Person; note: string; at: number };

const REVIEWER: readonly Actor[] = ['reviewer'];

const decidedEdit = (review: Review<ListingEditState>, state: 'approved' | 'rejected', { by, note, at }: Decided): Review<ListingEditState> => {
  if (review.state !== 'waiting') throw conflict('This is no longer waiting for review.');
  return { ...review, state, by, note, decidedAt: at };
};

const versionToDecide = (item: StoreItem, n: number): StoreVersion => {
  const version = versionOf(item, n);
  if (!version) throw notFound('No such version.');
  return version;
};

const markVersionApproved = (item: StoreItem, n: number, packKey: string, decided: Decided): ItemPatch => {
  const { by, note, at } = decided;
  const moved = moveVersion(item, {
    n,
    action: 'approve',
    actors: REVIEWER,
    reshape: (version, to) => ({ ...version, packKey, review: { ...version.review, state: to, by, note, decidedAt: at } }),
  });
  return { ...moved, publishedAt: item.publishedAt ?? at, updatedAt: at };
};

const markVersionRejected = (item: StoreItem, n: number, decided: Decided): ItemPatch => {
  const { by, note, at } = decided;
  return moveVersion(item, {
    n,
    action: 'reject',
    actors: REVIEWER,
    reshape: (version, to) => ({ ...version, review: { ...version.review, state: to, by, note, decidedAt: at } }),
  });
};

const editOf = (item: StoreItem, editId: string): ListingEdit => {
  const edit = item.listingEdits.find((entry) => entry.id === editId);
  if (!edit) throw notFound('No such listing edit.');
  return edit;
};

const replaceEdit = (item: StoreItem, next: ListingEdit): ListingEdit[] =>
  item.listingEdits.map((edit) => (edit.id === next.id ? next : edit));

const markEditApproved = (item: StoreItem, editId: string, decided: Decided): ItemPatch => {
  const edit = editOf(item, editId);
  const approved = { ...edit, review: decidedEdit(edit.review, 'approved', decided) };
  return { ...edit.patch, listingEdits: replaceEdit(item, approved), updatedAt: decided.at };
};

const markEditRejected = (item: StoreItem, editId: string, decided: Decided): ItemPatch => {
  const edit = editOf(item, editId);
  return { listingEdits: replaceEdit(item, { ...edit, review: decidedEdit(edit.review, 'rejected', decided) }) };
};

export { markVersionApproved, markVersionRejected, markEditApproved, markEditRejected, versionToDecide };
export type { Decided };
