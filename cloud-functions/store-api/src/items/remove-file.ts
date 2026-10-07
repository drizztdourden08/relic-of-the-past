/* @layer store-api @kind logic */
/** A version's file leaving the bucket while its row stays. The file is the approved copy
 *  under packs/ once there is one, the upload under incoming/ before that. The row is stamped
 *  first and the object removed after, so a failed write never loses a file the row still
 *  offers; an object left behind by a failed removal is only storage. */
import type { FileRemoval, StoreVersion } from '../../../../shared/store/types';
import { storeBucket } from '../storage/store-bucket';

const fileKeyOf = (version: Pick<StoreVersion, 'key' | 'packKey'>): string => version.packKey ?? version.key;

const removeFile = async (version: Pick<StoreVersion, 'key' | 'packKey'>): Promise<void> => {
  await storeBucket.remove(fileKeyOf(version)).catch(() => undefined);
};

/** The version stamped with its removal, unless it already carries one. */
const stampRemoved = (version: StoreVersion, removal: FileRemoval): StoreVersion =>
  (version.removed ? version : { ...version, removed: removal });

export { fileKeyOf, removeFile, stampRemoved };
