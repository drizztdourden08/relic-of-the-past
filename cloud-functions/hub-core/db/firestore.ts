/* @layer hub-core @kind logic */
/** The one Firestore client and the account collections every site shares. The ids keep
 *  their sanctuary- prefix: the accounts were the Sanctuary's first and renaming live data
 *  buys nothing. A site's own collections are opened by id through collectionOf. Client
 *  access is denied by firestore.rules; only the functions read or write. */
import { Firestore } from '@google-cloud/firestore';

const HUB_COLLECTIONS = {
  users: 'sanctuary-users',
  identities: 'sanctuary-identities',
  views: 'sanctuary-views',
  grants: 'sanctuary-grants',
  devices: 'sanctuary-devices',
  rateLimits: 'sanctuary-rate-limits',
  groups: 'sanctuary-groups',
} as const;

type HubCollection = keyof typeof HUB_COLLECTIONS;

let client: Firestore | null = null;

const db = (): Firestore => {
  if (!client) client = new Firestore();
  return client;
};

const collectionOf = (id: string) => db().collection(id);

const collection = (name: HubCollection) => collectionOf(HUB_COLLECTIONS[name]);

const now = (): number => Date.now();

/** Cursor for createdAt-descending pages: the last row's createdAt, as text. */
const decodeCursor = (cursor: string | undefined): number | null => {
  if (!cursor) return null;
  const value = Number(cursor);
  return Number.isFinite(value) ? value : null;
};

const encodeCursor = (createdAt: number): string => String(createdAt);

export { db, collection, collectionOf, HUB_COLLECTIONS, now, decodeCursor, encodeCursor };
export type { HubCollection };
