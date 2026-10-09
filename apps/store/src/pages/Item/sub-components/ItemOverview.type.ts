/* @layer store-site @kind types */
import type { StoreItem, StoreVersion } from '@rotp/hub-contracts';

type ItemOverviewProps = {
  item: StoreItem;
  version?: StoreVersion | null;
};

export type { ItemOverviewProps };
