/* @layer store-site @kind component */
/**
 * One item on a shelf or in a grid, as the plan mockup draws it: the card picture edge to
 * edge, then the name, a line with the author and the stars, and a line with the kind (and
 * what the player has of it) and one extra fact. The whole card is one link.
 */
import type { ReactNode } from 'react';
import { Flex } from '@ds/primitives/Flex';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import type { ItemCardView } from '@shared/store/home-types';
import { Chip } from '@site-kit/components/Chip/Chip';
import { Link } from '@site-kit/router/Link';
import { formatAverage } from '../../lib/format-count';
import { ItemPicture } from '../ItemPicture/ItemPicture';
import { KindChip } from '../KindChip/KindChip';
import { Stars } from '../Stars/Stars';
import './ItemCard.css';

/** What the player has of the item: installed, or installed with a newer version out. */
type OwnedState = 'installed' | 'update';

type ItemCardProps = {
  item: ItemCardView;
  /** Where the card leads. */
  to: string;
  selected?: boolean;
  owned?: OwnedState | null;
  /** The right side of the last line, such as "1 880 this month". */
  extra?: ReactNode;
};

const OWNED_CHIPS: Record<OwnedState, ReactNode> = {
  installed: <Chip tone="green">installed</Chip>,
  update: <Chip tone="gold">update</Chip>,
};

const byline = (item: ItemCardView) => (item.semver ? `${item.author.displayName} · v${item.semver}` : item.author.displayName);

const ItemCard = (props: ItemCardProps) => {
  const { item, to, selected = false, owned = null, extra } = props;
  return (
    <Link to={to} className={`item-card${selected ? ' item-card--selected' : ''}`} aria-current={selected ? 'page' : undefined}>
      <ItemPicture picture={item.card} kind={item.kind} className="item-card__picture" />
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
export type { ItemCardProps, OwnedState };
