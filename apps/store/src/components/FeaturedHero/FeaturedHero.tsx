/* @layer store-site @kind component */
/**
 * The featured row: one item at a time on its banner (its card when it has none), with its
 * name, kind, stars, one line and the author, Install and Open. Dots under it pick another
 * featured item; the hero moves on by itself otherwise. With nothing featured, the banner's
 * space holds an empty state.
 */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Flex } from '@ds/primitives/Flex';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import type { ItemCardView } from '@shared/store/home-types';
import { KIND_CONTAINER } from '@shared/store/containers';
import { Link } from '@site-kit/router/Link';
import { formatAverage, formatCount } from '../../lib/format-count';
import { EmptyState } from '../EmptyState/EmptyState';
import { InstallButton } from '../InstallButton/InstallButton';
import { ItemPicture } from '../ItemPicture/ItemPicture';
import { KindChip } from '../KindChip/KindChip';
import { Stars } from '../Stars/Stars';
import { useRotation } from './behavior/useRotation';
import './FeaturedHero.css';

type FeaturedHeroProps = {
  items: readonly ItemCardView[];
  itemPath: (item: ItemCardView) => string;
};

const FeaturedHero = (props: FeaturedHeroProps) => {
  const { items, itemPath } = props;
  const { index, select, hold, release } = useRotation(items.length);
  const item = items[index];
  if (!item) return <EmptyState message="Nothing featured yet." shape="banner" label="Featured" />;
  return (
    <Box as="section" className="featured-hero" aria-label="Featured" onMouseEnter={hold} onMouseLeave={release} onFocus={hold} onBlur={release}>
      <ItemPicture picture={item.banner ?? item.card} kind={item.kind} role="banner" className="featured-hero__picture" />
      <Stack gap="sm" align="start" className="featured-hero__copy">
        <Text as="span" className="featured-hero__eyebrow">Featured</Text>
        <Text as="h2" variant="title" className="featured-hero__name">{item.name}</Text>
        <Flex align="center" gap="sm" wrap>
          <KindChip kind={item.kind} />
          <Stars value={item.ratingAverage} />
          <Text as="span" variant="caption">{formatAverage(item.ratingAverage)} · {formatCount(item.ratingCount)}</Text>
        </Flex>
        <Text as="p" className="featured-hero__summary">{item.summary}, by {item.author.displayName}.</Text>
        <Flex align="center" gap="sm" wrap>
          <InstallButton itemId={item.id} container={item.semver ? KIND_CONTAINER[item.kind] : null} />
          <Link to={itemPath(item)} className="btn btn--tertiary btn--sm">Open {'›'}</Link>
        </Flex>
      </Stack>
      {items.length > 1 && (
        <Flex justify="center" gap="xs" className="featured-hero__dots">
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
    </Box>
  );
};

export { FeaturedHero };
export type { FeaturedHeroProps };
