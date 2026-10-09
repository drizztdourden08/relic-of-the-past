/* @layer store-api @kind logic */
import { FieldValue } from '@google-cloud/firestore';
import type { ItemStatus, StoreItem, StoreKind } from '../../../../shared/store/types';
import { notFound } from '../../../hub-core/http/http-error';
import { db, decodeCursor, encodeCursor } from '../../../hub-core/db/firestore';
import { isAwaitingReview } from '../items/item-status';
import { storeCollection } from './collections';
import type { ItemChange, ItemPage, ShelfField, StoredItem } from './items-repo.type';

const items = () => storeCollection('items');

const toItem = (data: unknown): StoreItem => {
  const { awaitingReview: _flag, ...item } = data as StoredItem;
  return item;
};

const withFlag = (item: StoreItem): StoredItem => ({ ...item, awaitingReview: isAwaitingReview(item) });

const ref = (id: string) => items().doc(id);

const newId = (): string => items().doc().id;

const create = async (item: StoreItem): Promise<void> => {
  await ref(item.id).set(withFlag(item));
};

const get = async (id: string): Promise<StoreItem | null> => {
  const snap = await ref(id).get();
  return snap.exists ? toItem(snap.data()) : null;
};

const getMany = async (ids: string[]): Promise<StoreItem[]> => {
  if (ids.length === 0) return [];
  const snaps = await db().getAll(...ids.map(ref));
  return snaps.filter((snap) => snap.exists).map((snap) => toItem(snap.data()));
};

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

const byAuthor = async (userId: string): Promise<StoreItem[]> => {
  const snap = await items().where('author.userId', '==', userId).orderBy('createdAt', 'desc').get();
  return snap.docs.map((doc) => toItem(doc.data()));
};

const awaitingReview = async (): Promise<StoreItem[]> => {
  const snap = await items().where('awaitingReview', '==', true).get();
  return snap.docs.map((doc) => toItem(doc.data()));
};

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
