/* @layer store-site @kind component */
import { useMemo } from 'react';
import { Box, EmptyState } from '@drizztdourden08/tessera/primitives';
import { Carousel } from '@drizztdourden08/tessera/composites';
import { FeaturedHero } from '../../../components/FeaturedHero/FeaturedHero';
import { FEATURED_LABEL, FEATURED_TURN_MS } from './FeaturedCarousel.constants';
import type { FeaturedCarouselProps } from './FeaturedCarousel.type';

const FeaturedCarousel = (props: FeaturedCarouselProps) => {
  const { items, itemPath } = props;
  const slides = useMemo(
    () => items.map((item) => ({ id: item.id, label: item.name, content: <FeaturedHero item={item} itemPath={itemPath} /> })),
    [items, itemPath],
  );
  if (items.length === 0) return <Box as="section" aria-label={FEATURED_LABEL}><EmptyState message="Nothing featured yet." size="hero" /></Box>;
  return <Carousel label={FEATURED_LABEL} slides={slides} turnEvery={FEATURED_TURN_MS} />;
};

export { FeaturedCarousel };
