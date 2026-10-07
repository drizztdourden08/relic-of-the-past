/* @layer store-api @kind logic */
/** Writes the featured row, first to last: the order in store-settings, mirrored onto each
 *  item's `featured`, cleared on the ones that left. The home page is rebuilt on its next read. */
import type { Person } from '../../../../shared/store/types';
import { now } from '../../../hub-core/db/firestore';
import { itemsRepo } from '../db/items-repo';
import { settingsRepo } from '../db/settings-repo';
import { invalidateHome } from './home-cache';

const saveFeatured = async (itemIds: string[], by: Person): Promise<void> => {
  const at = now();
  const previous = await settingsRepo.getFeatured();
  await settingsRepo.setFeatured({ itemIds, updatedBy: by, updatedAt: at });
  const left = previous.filter((id) => !itemIds.includes(id));
  await Promise.all([
    ...left.map((id) => itemsRepo.setFeatured(id, null).catch(() => undefined)),
    ...itemIds.map((id, rank) => itemsRepo.setFeatured(id, { rank, by, at })),
  ]);
  invalidateHome();
};

export { saveFeatured };
