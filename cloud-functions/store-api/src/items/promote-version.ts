/* @layer store-api @kind logic */
import { STORE_KEYS } from '../../../../shared/store/keys';
import type { StoreItem, StoreVersion } from '../../../../shared/store/types';
import { itemsRepo } from '../db/items-repo';
import { storeBucket } from '../storage/store-bucket';
import { markVersionApproved } from './mark-decided';
import type { Decided } from './mark-decided';
import { pruneFiles } from './prune-files';

const approveVersion = async (item: StoreItem, version: StoreVersion, decided: Decided): Promise<StoreItem> => {
  const packKey = STORE_KEYS.pack(item, version);
  await storeBucket.copy(version.key, packKey);
  const updated = await itemsRepo.mutate(item.id, (latest) => markVersionApproved(latest, version.n, packKey, decided));
  await storeBucket.remove(version.key).catch(() => undefined);
  return pruneFiles(updated, decided.at);
};

export { approveVersion };
