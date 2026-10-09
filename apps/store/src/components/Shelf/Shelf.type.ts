/* @layer store-site @kind types */
import type { ReactNode } from 'react';
import type { ItemCardView } from '@rotp/hub-contracts';

type ShelfProps = {
  title: string;
  lead?: string;
  items: readonly ItemCardView[];
  seeAll?: string;
  extraOf?: (item: ItemCardView) => ReactNode;
  itemPath: (item: ItemCardView) => string;
  emptyMessage?: string;
};

export type { ShelfProps };
