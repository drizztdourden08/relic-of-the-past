/* @layer store-api @kind logic */
import type { FileRemoval, StoreVersion } from '../../../../../shared/store/types';

const stampRemoved = (version: StoreVersion, removal: FileRemoval): StoreVersion =>
  (version.removed ? version : { ...version, removed: removal });

export { stampRemoved };
