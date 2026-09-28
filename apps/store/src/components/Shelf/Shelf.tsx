/* @layer store-site @kind component */
/**
 * One row of the home page, as the plan mockup draws it: the title, the line that says how
 * it is ordered and "See all" on one line, then one row of cards. The rest is behind "See
 * all". An empty shelf keeps the row's height and says so in the middle.
 */
import type { ReactNode } from 'react';
import { Box } from '@ds/primitives/Box';
import { Flex } from '@ds/primitives/Flex';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import type { ItemCardView } from '@shared/store/home-types';
import { Link } from '@site-kit/router/Link';
import { EmptyState } from '../EmptyState/EmptyState';
import { ItemCard } from '../ItemCard/ItemCard';
import './Shelf.css';

/** One row at the widest layout; matches --shelf-columns. */
const ROW = 4;

type ShelfProps = {
  title: string;
  /** How the shelf is ordered, beside the title. */
  lead?: string;
  items: readonly ItemCardView[];
  /** Where "See all" leads; no link without it. */
  seeAll?: string;
  /** The right side of a card's last line, such as its installs this month. */
  extraOf?: (item: ItemCardView) => ReactNode;
  itemPath: (item: ItemCardView) => string;
  emptyMessage?: string;
};

const Shelf = (props: ShelfProps) => {
  const { title, lead, items, seeAll, extraOf, itemPath, emptyMessage = 'Nothing here yet.' } = props;
  return (
    <Stack as="section" align="stretch" className="shelf" aria-label={title}>
      <Flex align="baseline" className="shelf__head">
        <Text as="h2" className="shelf__title">{title}</Text>
        {lead && <Text as="span" className="shelf__lead">{lead}</Text>}
        {seeAll && <Link to={seeAll} className="shelf__all">See all {'›'}</Link>}
      </Flex>
      {items.length === 0
        ? <EmptyState message={emptyMessage} shape="row" />
        : (
          <Box className="shelf__row">
            {items.slice(0, ROW).map((item) => <ItemCard key={item.id} item={item} to={itemPath(item)} extra={extraOf?.(item)} />)}
          </Box>
        )}
    </Stack>
  );
};

export { Shelf };
export type { ShelfProps };
