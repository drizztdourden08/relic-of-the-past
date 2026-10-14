/* @layer store-site @kind types */
import type { ItemCardView } from '@rotp/hub-contracts';

type FeaturedCarouselProps = {
  items: readonly ItemCardView[];
  itemPath: (item: ItemCardView) => string;
};

export type { FeaturedCarouselProps };
