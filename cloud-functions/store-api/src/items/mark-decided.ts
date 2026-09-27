/* @layer store-api @kind logic */
/** A reviewer's decision written onto the item, one pure change per outcome. Each reads the
 *  latest record inside the item's transaction and refuses a target that stopped waiting,
 *  so two reviewers cannot both decide it. Approving a version moves liveVersion to the
 *  newest approved one and publishes the item on its first approval. */
import type { Review } from '../../../../shared/store/review-types';
import type { ListingEdit, Person, StoreItem } from '../../../../shared/store/types';
import { conflict, notFound } from '../../../hub-core/http/http-error';
import type { ItemPatch } from '../db/items-repo';
import { statusAfter } from './item-status';
import { replaceVersion, versionOf } from './versions';

type Decided = { by: Person; note: string; at: number };

const decidedReview = (review: Review, state: 'approved' | 'rejected', { by, note, at }: Decided): Review => {
  if (review.state !== 'waiting') throw conflict('This is no longer waiting for review.');
  return { ...review, state, by, note, decidedAt: at };
};

const waitingVersion = (item: StoreItem, n: number) => {
  const version = versionOf(item, n);
  if (!version) throw notFound('No such version.');
  return version;
};

const markVersionApproved = (item: StoreItem, n: number, packKey: string, decided: Decided): ItemPatch => {
  const version = waitingVersion(item, n);
  const approved = { ...version, packKey, review: decidedReview(version.review, 'approved', decided) };
  const next = {
    versions: replaceVersion(item, approved),
    liveVersion: Math.max(item.liveVersion ?? 0, n),
    publishedAt: item.publishedAt ?? decided.at,
    updatedAt: decided.at,
  };
  return { ...next, status: statusAfter({ ...item, ...next }) };
};

const markVersionRejected = (item: StoreItem, n: number, decided: Decided): ItemPatch => {
  const version = waitingVersion(item, n);
  const versions = replaceVersion(item, { ...version, review: decidedReview(version.review, 'rejected', decided) });
  return { versions, status: statusAfter({ ...item, versions }) };
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
  const approved = { ...edit, review: decidedReview(edit.review, 'approved', decided) };
  return { ...edit.patch, listingEdits: replaceEdit(item, approved), updatedAt: decided.at };
};

const markEditRejected = (item: StoreItem, editId: string, decided: Decided): ItemPatch => {
  const edit = editOf(item, editId);
  return { listingEdits: replaceEdit(item, { ...edit, review: decidedReview(edit.review, 'rejected', decided) }) };
};

export { markVersionApproved, markVersionRejected, markEditApproved, markEditRejected, waitingVersion };
export type { Decided };
