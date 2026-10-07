/* @layer store-api @kind logic */
/** The store's own collections; the account ones are hub-core's. */
import { collectionOf } from '../../../hub-core/db/firestore';

const STORE_COLLECTIONS = {
  items: 'store-items',
  ratings: 'store-ratings',
  installs: 'store-installs',
  daily: 'store-daily',
  quotas: 'store-quotas',
  settings: 'store-settings',
} as const;

const storeCollection = (name: keyof typeof STORE_COLLECTIONS) => collectionOf(STORE_COLLECTIONS[name]);

/** `<itemId>_<userId>`, the id of a rating and of an install. */
const pairId = (itemId: string, userId: string): string => `${itemId}_${userId}`;

export { STORE_COLLECTIONS, storeCollection, pairId };
