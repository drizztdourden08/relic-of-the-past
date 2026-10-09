/* @layer root-config @kind logic */
import { collectionOf } from '@rotp/hub-server';
import { SANCTUARY_COLLECTIONS } from './collections.constants';

const sanctuaryCollection = (name: keyof typeof SANCTUARY_COLLECTIONS) => collectionOf(SANCTUARY_COLLECTIONS[name]);

export { sanctuaryCollection };
