/* @layer store-site @kind types */
import type { StoreItem, StoreVersion } from '@shared/store/types';

type ItemVersionsProps = {
  item: StoreItem;
  versions: readonly StoreVersion[];
  canModerate: boolean;
  onItem: (item: StoreItem) => void;
};

export type { ItemVersionsProps };
