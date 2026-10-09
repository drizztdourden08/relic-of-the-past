/* @layer store-site @kind types */
import type { ItemCardView } from '@shared/store/home-types';

type FeaturedHeroProps = {
  items: readonly ItemCardView[];
  itemPath: (item: ItemCardView) => string;
};

export type { FeaturedHeroProps };
