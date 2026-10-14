/* @layer store-site @kind types */
import type { ItemCardView } from '@rotp/hub-contracts';

type FeaturedHeroProps = {
  item: ItemCardView;
  itemPath: (item: ItemCardView) => string;
};

export type { FeaturedHeroProps };
