/* @layer renderer-components @kind logic */
import type { InstalledPack } from '@rotp/hub-contracts';
import type { ItemCardView } from '@rotp/hub-contracts';
import type { StoreItemStatus } from '../../../compounds/StoreItemCard';
import { hasUpdate } from './has-update';

const statusOf = (packs: InstalledPack[], item: ItemCardView): StoreItemStatus => {
  const pack = packs.find((p) => p.itemId === item.id);
  if (!pack) return null;
  return hasUpdate(pack, item) ? 'update' : 'installed';
};

export { statusOf };
