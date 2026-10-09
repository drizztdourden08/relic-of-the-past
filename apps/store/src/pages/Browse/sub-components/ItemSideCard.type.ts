/* @layer store-site @kind types */
import type { ItemResponse, ItemCardView } from '@rotp/hub-contracts';

type ItemSideCardProps = {
  item: ItemCardView;
  detail: ItemResponse | null;
  onClose: () => void;
};

export type { ItemSideCardProps };
