/* @layer store-site @kind types */
import type { StoreItem, StoreVersion } from '@rotp/hub-contracts';

type ItemVersionsProps = {
  item: StoreItem;
  versions: readonly StoreVersion[];
  canModerate: boolean;
  onItem: (item: StoreItem) => void;
};

export type { ItemVersionsProps };
