/* @layer store-site @kind component */
/**
 * The Store page tab: the listing as players will see it once approved. The item's card as
 * on a shelf, the featured hero when it has a banner, then its page's overview showing the
 * version under review.
 */
import { useMemo } from 'react';
import { Box } from '@ds/primitives/Box';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { FeaturedHero } from '../../../components/FeaturedHero/FeaturedHero';
import { ItemCard } from '../../../components/ItemCard/ItemCard';
import { itemPath } from '../../../catalog/item-paths';
import { ItemOverview } from '../../Item/sub-components/ItemOverview';
import type { ItemPreview } from '../behavior/preview-item';

type StorePagePreviewProps = { preview: ItemPreview };

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
        <ItemOverview item={item} version={version} />
      </Stack>
    </Stack>
  );
};

export { StorePagePreview };
export type { StorePagePreviewProps };
