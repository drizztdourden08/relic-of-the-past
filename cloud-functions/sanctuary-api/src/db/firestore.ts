/* @layer root-config @kind logic */
/** The one Firestore client and the collection names every repository uses.
 *  Client access is denied by firestore.rules; only this function reads or writes. */
import { Firestore } from '@google-cloud/firestore';

const COLLECTIONS = {
  users: 'sanctuary-users',
  identities: 'sanctuary-identities',
  files: 'sanctuary-files',
  views: 'sanctuary-views',
  grants: 'sanctuary-grants',
  devices: 'sanctuary-devices',
  reports: 'sanctuary-reports',
  rateLimits: 'sanctuary-rate-limits',
} as const;

type CollectionName = keyof typeof COLLECTIONS;

let client: Firestore | null = null;

const db = (): Firestore => {
  if (!client) client = new Firestore();
  return client;
};

const collection = (name: CollectionName) => db().collection(COLLECTIONS[name]);

const now = (): number => Date.now();

/** Cursor for createdAt-descending pages: the last row's createdAt, as text. */
const decodeCursor = (cursor: string | undefined): number | null => {
  if (!cursor) return null;
  const value = Number(cursor);
  return Number.isFinite(value) ? value : null;
};

const encodeCursor = (createdAt: number): string => String(createdAt);

export { db, collection, COLLECTIONS, now, decodeCursor, encodeCursor };
export type { CollectionName };
