/* @layer store-site @kind component */
/**
 * One row of the home page: a title with the line that says how it is ordered, a
 * "See all" link, then its items as cards side by side, scrolling sideways when they
 * outgrow the page. An empty shelf says so in one line.
 */
import type { ReactNode } from 'react';
import { Box } from '@ds/primitives/Box';
import { Flex } from '@ds/primitives/Flex';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import type { ItemCardView } from '@shared/store/home-types';
import { Link } from '@site-kit/router/Link';
import { ItemCard } from '../ItemCard/ItemCard';
import './Shelf.css';

type ShelfProps = {
  title: string;
  /** How the shelf is ordered, under the title. */
  lead?: string;
  items: readonly ItemCardView[];
  /** Where "See all" leads; no link without it. */
  seeAll?: string;
  /** A line under one card, such as its installs this month. */
  extraOf?: (item: ItemCardView) => ReactNode;
  itemPath: (item: ItemCardView) => string;
  emptyMessage?: string;
};

const Shelf = (props: ShelfProps) => {
  const { title, lead, items, seeAll, extraOf, itemPath, emptyMessage = 'Nothing here yet.' } = props;
  return (
    <Stack as="section" gap="sm" align="stretch" className="shelf" aria-label={title}>
      <Flex align="baseline" justify="between" gap="md">
        <Stack gap="xs">
          <Text as="h2" variant="subtitle" className="shelf__title">{title}</Text>
          {lead && <Text as="span" variant="caption">{lead}</Text>}
        </Stack>
        {seeAll && <Link to={seeAll} className="shelf__all">See all {'›'}</Link>}
      </Flex>
      {items.length === 0
        ? <Text as="p" variant="caption">{emptyMessage}</Text>
        : (
          <Box className="shelf__row">
            {items.map((item) => <ItemCard key={item.id} item={item} to={itemPath(item)} extra={extraOf?.(item)} />)}
          </Box>
        )}
    </Stack>
  );
};

export { Shelf };
export type { ShelfProps };
