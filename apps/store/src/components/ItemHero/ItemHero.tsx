/* @layer store-site @kind component */
/**
 * The top of an item's page, drawn like the app's Home hero: the item's banner (its card,
 * or its coloured placeholder, when it has none) fills the scene, the kind, name, short
 * description, author and stars float bottom-left with the host's actions, and the facts
 * of the version on show run along the bottom in glass.
 */
import type { ReactNode } from 'react';
import { Hero } from '@domains/app/compounds/Hero';
import { HeroFacts } from '@domains/app/compounds/HeroFacts';
import { Box } from '@ds/primitives/Box';
import { Flex } from '@ds/primitives/Flex';
import { Text } from '@ds/primitives/Text';
import type { StoreItem, StoreVersion } from '@shared/store/types';
import { Link } from '@site-kit/router/Link';
import { authorPath } from '../../catalog/item-paths';
import { KIND_PLURALS } from '../../lib/kinds';
import { averageOf } from '../../lib/format-count';
import { ItemPicture } from '../ItemPicture/ItemPicture';
import { Stars } from '../Stars/Stars';
import { itemHeroFacts } from './behavior/item-hero-facts';
import './ItemHero.css';

type ItemHeroProps = {
  item: StoreItem;
  /** The version whose facts are shown: the live one on the item page, the one under review in a review. */
  version: StoreVersion | null;
  /** Install and the moderation buttons, under the title. */
  actions?: ReactNode;
};

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
export type { ItemHeroProps };
