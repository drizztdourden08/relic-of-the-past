/* @layer store-api @kind logic */
/** Store items. Each stored record carries `awaitingReview`, set on every write from its
 *  versions and listing edits, so the review queue is one equality query. The flag stays
 *  in Firestore: every read strips it, so no answer ever carries it. */
import { FieldValue } from '@google-cloud/firestore';
import type { ItemStatus, StoreItem, StoreKind } from '../../../../shared/store/types';
import { notFound } from '../../../hub-core/http/http-error';
import { db, decodeCursor, encodeCursor } from '../../../hub-core/db/firestore';
import { isAwaitingReview } from '../items/item-status';
import { storeCollection } from './collections';

type StoredItem = StoreItem & { awaitingReview: boolean };
type ItemPatch = Partial<Omit<StoreItem, 'id' | 'kind' | 'author' | 'createdAt'>>;
/** Reads the latest record inside a transaction and answers the patch to write; throwing aborts. */
type ItemChange = (item: StoreItem) => ItemPatch;
type ItemPage = { items: StoreItem[]; nextCursor: string | null };
/** The fields a shelf sorts by, highest first. */
type ShelfField = 'stats.installs30d' | 'stats.score' | 'updatedAt';

const items = () => storeCollection('items');

const toItem = (data: unknown): StoreItem => {
  const { awaitingReview: _flag, ...item } = data as StoredItem;
  return item;
};

const withFlag = (item: StoreItem): StoredItem => ({ ...item, awaitingReview: isAwaitingReview(item) });

const ref = (id: string) => items().doc(id);

/** A fresh Firestore id: letters and digits, which an install link accepts. */
const newId = (): string => items().doc().id;

const create = async (item: StoreItem): Promise<void> => {
  await ref(item.id).set(withFlag(item));
};

const get = async (id: string): Promise<StoreItem | null> => {
  const snap = await ref(id).get();
  return snap.exists ? toItem(snap.data()) : null;
};

/** The records for these ids, in the order given; missing ones drop out. */
const getMany = async (ids: string[]): Promise<StoreItem[]> => {
  if (ids.length === 0) return [];
  const snaps = await db().getAll(...ids.map(ref));
  return snaps.filter((snap) => snap.exists).map((snap) => toItem(snap.data()));
};

/** Read, change and write one item atomically; used wherever versions, edits or status move. */
const mutate = (id: string, change: ItemChange): Promise<StoreItem> =>
  db().runTransaction(async (tx) => {
    const snap = await tx.get(ref(id));
    if (!snap.exists) throw notFound('No such item.');
    const item = toItem(snap.data());
    const next = { ...item, ...change(item) };
    tx.set(ref(id), withFlag(next));
    return next;
  });

const setStatus = async (id: string, status: ItemStatus): Promise<void> => {
  await ref(id).update({ status });
};

const setFeatured = async (id: string, featured: StoreItem['featured']): Promise<void> => {
  await ref(id).update({ featured });
};

const setInstalls30d = async (id: string, installs30d: number): Promise<void> => {
  await ref(id).update({ 'stats.installs30d': installs30d });
};

const bumpInstalls = () => ({ 'stats.installs': FieldValue.increment(1) });

/** Published items, newest first, optionally of one kind. The cursor is the last row's createdAt. */
const listPublished = async (kind: StoreKind | null, cursor: string | undefined, pageSize: number): Promise<ItemPage> => {
  let query = items().where('status', '==', 'published');
  if (kind) query = query.where('kind', '==', kind);
  query = query.orderBy('createdAt', 'desc').limit(pageSize);
  const after = decodeCursor(cursor);
  if (after !== null) query = query.startAfter(after);
  const snap = await query.get();
  const page = snap.docs.map((doc) => toItem(doc.data()));
  const last = page[page.length - 1];
  return { items: page, nextCursor: page.length === pageSize && last ? encodeCursor(last.createdAt) : null };
};

const topPublished = async (field: ShelfField, limit: number): Promise<StoreItem[]> => {
  const snap = await items().where('status', '==', 'published').orderBy(field, 'desc').limit(limit).get();
  return snap.docs.map((doc) => toItem(doc.data()));
};

/** Every item of one author, whatever its status, newest first. */
const byAuthor = async (userId: string): Promise<StoreItem[]> => {
  const snap = await items().where('author.userId', '==', userId).orderBy('createdAt', 'desc').get();
  return snap.docs.map((doc) => toItem(doc.data()));
};

const awaitingReview = async (): Promise<StoreItem[]> => {
  const snap = await items().where('awaitingReview', '==', true).get();
  return snap.docs.map((doc) => toItem(doc.data()));
};

/** The whole catalogue, for the daily job. */
const all = async (): Promise<StoreItem[]> => {
  const snap = await items().get();
  return snap.docs.map((doc) => toItem(doc.data()));
};

const itemsRepo = {
  ref,
  newId,
  create,
  get,
  getMany,
  mutate,
  setStatus,
  setFeatured,
  setInstalls30d,
  bumpInstalls,
  listPublished,
  topPublished,
  byAuthor,
  awaitingReview,
  all,
};

export { itemsRepo };
export type { ItemPatch, ItemChange, ItemPage, ShelfField };
