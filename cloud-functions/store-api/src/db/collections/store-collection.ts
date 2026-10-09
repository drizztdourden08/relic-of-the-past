/* @layer store-api @kind logic */
import { collectionOf } from '@rotp/hub-server';
import { STORE_COLLECTIONS } from './collections.constants';

const storeCollection = (name: keyof typeof STORE_COLLECTIONS) => collectionOf(STORE_COLLECTIONS[name]);

export { storeCollection };
