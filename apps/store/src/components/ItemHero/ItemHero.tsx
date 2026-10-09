/* @layer store-site @kind component */
import { Hero } from '@domains/app/compounds/Hero';
import { HeroFacts } from '@domains/app/compounds/HeroFacts';
import { Box } from '@ds/primitives/Box';
import { Flex } from '@ds/primitives/Flex';
import { Text } from '@ds/primitives/Text';
import { Link } from '@site-kit/router/Link';
import { authorPath } from '../../catalog/item-paths/author-path';
import { KIND_PLURALS } from '../../lib/kinds/kinds.constants';
import { averageOf } from '../../lib/format-count/average-of';
import { ItemPicture } from '../ItemPicture/ItemPicture';
import { Stars } from '../Stars/Stars';
import { itemHeroFacts } from './behavior/item-hero-facts';
import type { ItemHeroProps } from './ItemHero.type';
import './ItemHero.css';

const ItemHero = (props: ItemHeroProps) => {
  const { item, version, actions } = props;
  const backdrop = (
    <ItemPicture picture={item.banner ?? item.card} kind={item.kind} color={item.color} role="banner" className="item-hero__picture" />
  );
  const intro = (
    <>
      <Text className="hero__eyebrow">{KIND_PLURALS[item.kind]}</Text>
      <Text as="h2" className="hero__title">{item.name}</Text>
      <Text as="p" className="item-hero__summary">{item.summary}</Text>
      <Flex align="center" gap="sm" wrap className="item-hero__byline">
        <Text as="span">by <Link to={authorPath(item.author.userId)} className="item-hero__author">{item.author.displayName}</Link></Text>
        <Stars value={averageOf(item.stats.ratingSum, item.stats.ratingCount)} />
      </Flex>
      {actions && <Box className="hero__actions">{actions}</Box>}
    </>
  );
  return (
    <Hero
      ariaLabel={item.name}
      className="item-hero"
      backdrop={backdrop}
      intro={intro}
      bottom={<HeroFacts facts={itemHeroFacts(item, version)} />}
    />
  );
};

export { ItemHero };
export type { ItemHeroProps } from './ItemHero.type';
