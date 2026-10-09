/* @layer store-api @kind logic */
import type { FileRemoval, StoreVersion } from '@rotp/hub-contracts';

const stampRemoved = (version: StoreVersion, removal: FileRemoval): StoreVersion =>
  (version.removed ? version : { ...version, removed: removal });

export { stampRemoved };
