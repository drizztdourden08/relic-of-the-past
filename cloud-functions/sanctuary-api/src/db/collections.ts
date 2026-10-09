/* @layer root-config @kind logic */
import { collectionOf } from '../../../hub-core/db/firestore';
import { SANCTUARY_COLLECTIONS } from './collections.constants';

const sanctuaryCollection = (name: keyof typeof SANCTUARY_COLLECTIONS) => collectionOf(SANCTUARY_COLLECTIONS[name]);

export { sanctuaryCollection };
