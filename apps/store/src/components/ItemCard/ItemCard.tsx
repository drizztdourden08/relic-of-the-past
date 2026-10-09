/* @layer store-site @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { ItemCard as CatalogCard } from '@drizztdourden08/tessera/composites';
import type { ItemCardView } from '@shared/store/home-types';
import { formatAverage } from '../../lib/format-count/format-average';
import { ItemPicture } from '../ItemPicture/ItemPicture';
import { KindChip } from '../KindChip/KindChip';
import { Stars } from '../Stars/Stars';
import type { ItemCardProps } from './ItemCard.type';
import { OWNED_STATUS } from './ItemCard.constants';
import './ItemCard.css';

const byline = (item: ItemCardView) => (item.semver ? `${item.author.displayName} · v${item.semver}` : item.author.displayName);

const ItemCard = (props: ItemCardProps) => {
  const { item, to, selected = false, owned = null, extra } = props;
  const rating = (
    <Box as="span" className="store-card__rating">
      <Stars value={item.ratingAverage} />
      <Text as="span">{formatAverage(item.ratingAverage)}</Text>
    </Box>
  );
  return (
    <CatalogCard
      title={item.name}
      href={to}
      selected={selected}
      media={<ItemPicture picture={item.card} kind={item.kind} color={item.color} className="store-card__picture" />}
      mediaTone="neutral"
      status={owned ? OWNED_STATUS[owned] : undefined}
      tags={[<KindChip key="kind" kind={item.kind} />]}
      details={extra ? [byline(item), rating, extra] : [byline(item), rating]}
      className="store-card"
    />
  );
};

export { ItemCard };
export type { ItemCardProps, OwnedState } from './ItemCard.type';
