/* @layer store-site @kind component */
import { Box, Flex, Stack, Tag, Text } from '@drizztdourden08/tessera/primitives';
import { Rating } from '@drizztdourden08/tessera/composites';
import { KIND_CONTAINER } from '@rotp/hub-contracts';
import { AppLink } from '@rotp/design';
import { InstallButton } from '../InstallButton/InstallButton';
import { itemColorStyle } from '../../catalog/item-color-style';
import { ItemPicture } from '../ItemPicture/ItemPicture';
import { KindChip } from '../KindChip/KindChip';
import type { FeaturedHeroProps } from './FeaturedHero.type';
import './FeaturedHero.css';

const FeaturedHero = (props: FeaturedHeroProps) => {
  const { item, itemPath } = props;
  return (
    <Box className="featured-hero" style={itemColorStyle(item.color)}>
      <ItemPicture picture={item.banner ?? item.card} kind={item.kind} role="banner" color={item.color} className="featured-hero__picture" />
      <Stack align="start" className="featured-hero__copy">
        <Tag color="primary">Featured</Tag>
        <Text as="h2" className="featured-hero__name">{item.name}</Text>
        <Flex align="center" gap="sm" wrap>
          <KindChip kind={item.kind} />
          <Rating value={item.ratingAverage} count={item.ratingCount} showValue size="sm" />
        </Flex>
        <Text as="p" className="featured-hero__summary">{item.summary}, by {item.author.displayName}.</Text>
        <Flex align="center" gap="sm" className="featured-hero__actions">
          <InstallButton itemId={item.id} container={item.semver ? KIND_CONTAINER[item.kind] : null} />
          <AppLink to={itemPath(item)} className="btn btn--tertiary btn--toned btn--sm">Open</AppLink>
        </Flex>
      </Stack>
    </Box>
  );
};

export { FeaturedHero };
export type { FeaturedHeroProps } from './FeaturedHero.type';
