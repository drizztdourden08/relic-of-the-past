/* @layer store-site @kind types */
import type { ItemCardView } from '@rotp/hub-contracts';
import type { StoreItem, StoreVersion } from '@rotp/hub-contracts';

type ItemPreview = {
  item: StoreItem;
  version: StoreVersion | null;
  card: ItemCardView;
};

export type { ItemPreview };
