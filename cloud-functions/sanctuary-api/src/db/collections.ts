/* @layer root-config @kind logic */
/** The Sanctuary's own collections; the account ones are hub-core's. */
import { collectionOf } from '../../../hub-core/db/firestore';

const SANCTUARY_COLLECTIONS = {
  files: 'sanctuary-files',
  reports: 'sanctuary-reports',
} as const;

const sanctuaryCollection = (name: keyof typeof SANCTUARY_COLLECTIONS) => collectionOf(SANCTUARY_COLLECTIONS[name]);

export { SANCTUARY_COLLECTIONS, sanctuaryCollection };
