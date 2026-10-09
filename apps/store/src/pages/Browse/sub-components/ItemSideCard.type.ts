/* @layer store-site @kind types */
import type { ItemResponse } from '@shared/store/api-types';
import type { ItemCardView } from '@shared/store/home-types';

type ItemSideCardProps = {
  item: ItemCardView;
  detail: ItemResponse | null;
  onClose: () => void;
};

export type { ItemSideCardProps };
