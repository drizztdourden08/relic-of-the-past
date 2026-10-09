/* @layer store-site @kind component */
import { useMemo } from 'react';
import { Box, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { FeaturedHero } from '../../../components/FeaturedHero/FeaturedHero';
import { ItemCard } from '../../../components/ItemCard/ItemCard';
import { ItemHero } from '../../../components/ItemHero';
import { itemPath } from '../../../catalog/item-paths';
import { ItemOverview } from '../../Item/sub-components/ItemOverview';
import type { StorePagePreviewProps } from './StorePagePreview.type';

const StorePagePreview = (props: StorePagePreviewProps) => {
  const { preview } = props;
  const { item, version, card } = preview;
  const featured = useMemo(() => [card], [card]);
  return (
    <Stack gap="lg" align="stretch" className="review-item__store">
      <Stack gap="xs" align="stretch">
        <Text as="span" variant="label">On a shelf</Text>
        <Box className="review-item__card">
          <ItemCard item={card} to={itemPath(item)} />
        </Box>
      </Stack>
      {item.banner && (
        <Stack gap="xs" align="stretch">
          <Text as="span" variant="label">Featured</Text>
          <FeaturedHero items={featured} itemPath={itemPath} />
        </Stack>
      )}
      <Stack gap="xs" align="stretch">
        <Text as="span" variant="label">Item page</Text>
        <ItemHero item={item} version={version} />
        <ItemOverview item={item} version={version} />
      </Stack>
    </Stack>
  );
};

export { StorePagePreview };
