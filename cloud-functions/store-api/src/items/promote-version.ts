/* @layer store-api @kind logic */
/** Approving a version moves its pack from incoming/ to packs/ inside the bucket: copy,
 *  record, then delete the upload. packs/ only ever holds approved packs, so a leaked
 *  download link cannot serve anything unreviewed. A copy left behind by a refused record
 *  is overwritten by the next approval of the same version. */
import { STORE_KEYS } from '../../../../shared/store/keys';
import type { StoreItem, StoreVersion } from '../../../../shared/store/types';
import { itemsRepo } from '../db/items-repo';
import { storeBucket } from '../storage/store-bucket';
import { markVersionApproved } from './mark-decided';
import type { Decided } from './mark-decided';

const approveVersion = async (item: StoreItem, version: StoreVersion, decided: Decided): Promise<StoreItem> => {
  const packKey = STORE_KEYS.pack(item, version);
  await storeBucket.copy(version.key, packKey);
  const updated = await itemsRepo.mutate(item.id, (latest) => markVersionApproved(latest, version.n, packKey, decided));
  await storeBucket.remove(version.key).catch(() => undefined);
  return updated;
};

export { approveVersion };
