/* @layer hub-core @kind logic */
import { collectionOf } from './collection-of';
import { HUB_COLLECTIONS } from './firestore.constants';
import type { HubCollection } from './firestore.type';

const collection = (name: HubCollection) => collectionOf(HUB_COLLECTIONS[name]);

export { collection };
