/* @layer store-site @kind types */
import type { ItemCardView } from '@shared/store/home-types';
import type { StoreItem, StoreVersion } from '@shared/store/types';

type ItemPreview = {
  item: StoreItem;
  version: StoreVersion | null;
  card: ItemCardView;
};

export type { ItemPreview };
