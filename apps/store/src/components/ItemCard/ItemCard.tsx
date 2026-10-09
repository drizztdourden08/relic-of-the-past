/* @layer store-site @kind component */
import { Flex } from '@ds/primitives/Flex';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import type { ItemCardView } from '@shared/store/home-types';
import { Link } from '@site-kit/router/Link';
import { formatAverage } from '../../lib/format-count/format-average';
import { itemColorStyle } from '../../lib/item-color-style';
import { ItemPicture } from '../ItemPicture/ItemPicture';
import { KindChip } from '../KindChip/KindChip';
import { Stars } from '../Stars/Stars';
import type { ItemCardProps } from './ItemCard.type';
import { OWNED_CHIPS } from './ItemCard.constants';
import './ItemCard.css';

const byline = (item: ItemCardView) => (item.semver ? `${item.author.displayName} · v${item.semver}` : item.author.displayName);

const ItemCard = (props: ItemCardProps) => {
  const { item, to, selected = false, owned = null, extra } = props;
  return (
    <Link to={to} className={`item-card${selected ? ' item-card--selected' : ''}`} style={itemColorStyle(item.color)} aria-current={selected ? 'page' : undefined}>
      <ItemPicture picture={item.card} kind={item.kind} color={item.color} className="item-card__picture" />
      <Stack align="stretch" className="item-card__body">
        <Text as="span" className="item-card__name">{item.name}</Text>
        <Flex align="center" justify="between" className="item-card__meta">
          <Text as="span" className="item-card__byline">{byline(item)}</Text>
          <Flex align="center" gap="xs">
            <Stars value={item.ratingAverage} />
            <Text as="span" className="item-card__average">{formatAverage(item.ratingAverage)}</Text>
          </Flex>
        </Flex>
        <Flex align="center" justify="between" className="item-card__meta">
          <Flex align="center" gap="xs">
            <KindChip kind={item.kind} />
            {owned && OWNED_CHIPS[owned]}
          </Flex>
          {extra && <Text as="span" className="item-card__extra">{extra}</Text>}
        </Flex>
      </Stack>
    </Link>
  );
};

export { ItemCard };
export type { ItemCardProps, OwnedState } from './ItemCard.type';
