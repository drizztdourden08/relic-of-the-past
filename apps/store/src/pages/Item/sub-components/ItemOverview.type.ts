/* @layer store-site @kind types */
import type { StoreItem, StoreVersion } from '@shared/store/types';

type ItemOverviewProps = {
  item: StoreItem;
  version?: StoreVersion | null;
};

export type { ItemOverviewProps };
