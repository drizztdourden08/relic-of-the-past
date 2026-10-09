/* @layer store-site @kind types */
import type { ItemResponse } from '@rotp/hub-contracts';
import type { ItemCardView } from '@rotp/hub-contracts';

type ItemSideCardProps = {
  item: ItemCardView;
  detail: ItemResponse | null;
  onClose: () => void;
};

export type { ItemSideCardProps };
