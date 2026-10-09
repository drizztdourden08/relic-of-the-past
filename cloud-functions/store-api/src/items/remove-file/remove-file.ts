/* @layer store-api @kind logic */
import type { StoreVersion } from '@rotp/hub-contracts';
import { storeBucket } from '../../storage/store-bucket';

const fileKeyOf = (version: Pick<StoreVersion, 'key' | 'packKey'>): string => version.packKey ?? version.key;

const removeFile = async (version: Pick<StoreVersion, 'key' | 'packKey'>): Promise<void> => {
  await storeBucket.remove(fileKeyOf(version)).catch(() => undefined);
};

export { removeFile };
