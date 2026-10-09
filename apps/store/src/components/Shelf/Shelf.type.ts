/* @layer store-site @kind types */
import type { ReactNode } from 'react';
import type { ItemCardView } from '@shared/store/home-types';

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
