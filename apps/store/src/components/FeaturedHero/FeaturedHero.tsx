/* @layer store-site @kind component */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Flex } from '@ds/primitives/Flex';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { KIND_CONTAINER } from '@shared/store/containers';
import { Chip } from '@site-kit/components/Chip/Chip';
import { Link } from '@site-kit/router/Link';
import { formatAverage } from '../../lib/format-count/format-average';
import { formatCount } from '../../lib/format-count/format-count';
import { EmptyState } from '../EmptyState/EmptyState';
import { InstallButton } from '../InstallButton/InstallButton';
import { itemColorStyle } from '../../lib/item-color-style';
import { ItemPicture } from '../ItemPicture/ItemPicture';
import { KindChip } from '../KindChip/KindChip';
import { Stars } from '../Stars/Stars';
import { useRotation } from './behavior/useRotation';
import type { FeaturedHeroProps } from './FeaturedHero.type';
import './FeaturedHero.css';

const FeaturedHero = (props: FeaturedHeroProps) => {
  const { items, itemPath } = props;
  const { index, select, hold, release } = useRotation(items.length);
  const item = items[index];
  if (!item) return <EmptyState message="Nothing featured yet." shape="banner" label="Featured" />;
  return (
    <Box as="section" className="featured-hero" style={itemColorStyle(item.color)} aria-label="Featured" onMouseEnter={hold} onMouseLeave={release} onFocus={hold} onBlur={release}>
      <ItemPicture picture={item.banner ?? item.card} kind={item.kind} role="banner" color={item.color} className="featured-hero__picture" />
      <Stack align="start" className="featured-hero__copy">
        <Chip tone="gold">Featured</Chip>
        <Text as="h2" className="featured-hero__name">{item.name}</Text>
        <Flex align="center" gap="sm" wrap>
          <KindChip kind={item.kind} />
          <Stars value={item.ratingAverage} />
          <Text as="span" variant="caption">{formatAverage(item.ratingAverage)} · {formatCount(item.ratingCount)}</Text>
        </Flex>
        <Text as="p" className="featured-hero__summary">{item.summary}, by {item.author.displayName}.</Text>
        <Flex align="center" gap="sm" className="featured-hero__actions">
          <InstallButton itemId={item.id} container={item.semver ? KIND_CONTAINER[item.kind] : null} />
          <Link to={itemPath(item)} className="btn btn--tertiary btn--sm">Open</Link>
          {items.length > 1 && (
            <Flex gap="xs" className="featured-hero__dots">
              {items.map((entry, i) => (
                <Button
                  key={entry.id}
                  variant="bare"
                  className="featured-hero__dot"
                  data-on={i === index || undefined}
                  aria-label={`Show ${entry.name}`}
                  aria-pressed={i === index}
                  onClick={() => select(i)}
                />
              ))}
            </Flex>
          )}
        </Flex>
      </Stack>
    </Box>
  );
};

export { FeaturedHero };
export type { FeaturedHeroProps } from './FeaturedHero.type';
