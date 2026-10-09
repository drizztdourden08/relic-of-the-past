/* @layer store-site @kind types */
import type { ItemCardView } from '@shared/store/home-types';
import type { OwnedState } from '../ItemCard/ItemCard.type';

type ItemGridProps = {
  items: readonly ItemCardView[];
  itemPath: (item: ItemCardView) => string;
  selectedId?: string | null;
  ownedOf?: (item: ItemCardView) => OwnedState | null;
  emptyMessage: string;
  onOpen?: () => void;
};

export type { ItemGridProps };
