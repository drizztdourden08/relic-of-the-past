/* @layer store-site @kind component */
import { Flex, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { Hero, Rating } from '@drizztdourden08/tessera/composites';
import { AppLink } from '@rotp/design';
import { authorPath } from '../../catalog/item-paths/author-path';
import { KIND_PLURALS } from '../../kinds/kinds.constants';
import { averageOf } from '../../format-count/average-of';
import { ItemPicture } from '../ItemPicture/ItemPicture';
import { itemHeroFacts } from './behavior/item-hero-facts';
import type { ItemHeroProps } from './ItemHero.type';
import './ItemHero.css';

const ItemHero = (props: ItemHeroProps) => {
  const { item, version, actions } = props;
  const picture = (
    <ItemPicture picture={item.banner ?? item.card} kind={item.kind} color={item.color} role="banner" className="item-hero__picture" />
  );
  const about = (
    <Stack gap="sm" align="stretch">
      <Text as="p" className="item-hero__summary">{item.summary}</Text>
      <Flex align="center" gap="sm" wrap className="item-hero__byline">
        <Text as="span">by <AppLink to={authorPath(item.author.userId)}>{item.author.displayName}</AppLink></Text>
        <Rating value={averageOf(item.stats.ratingSum, item.stats.ratingCount)} size="sm" />
      </Flex>
    </Stack>
  );
  return (
    <Hero
      label={item.name}
      className="item-hero"
      eyebrow={KIND_PLURALS[item.kind]}
      title={item.name}
      backdrop={{ kind: 'node', node: picture }}
      actions={actions}
      aside={about}
      facts={[itemHeroFacts(item, version)]}
    />
  );
};

export { ItemHero };
export type { ItemHeroProps } from './ItemHero.type';
