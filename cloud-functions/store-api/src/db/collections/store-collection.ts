/* @layer store-api @kind logic */
import { collectionOf } from '../../../../hub-core/db/firestore';
import { STORE_COLLECTIONS } from './collections.constants';

const storeCollection = (name: keyof typeof STORE_COLLECTIONS) => collectionOf(STORE_COLLECTIONS[name]);

export { storeCollection };
