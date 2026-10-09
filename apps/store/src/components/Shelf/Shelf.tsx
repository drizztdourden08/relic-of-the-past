/* @layer store-site @kind component */
import { Box, Flex, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { Link } from '@site-kit/router/Link';
import { EmptyState } from '../EmptyState/EmptyState';
import { ItemCard } from '../ItemCard/ItemCard';
import type { ShelfProps } from './Shelf.type';
import { CARDS_PER_WIDEST_ROW } from './Shelf.constants';
import './Shelf.css';

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
            {items.slice(0, CARDS_PER_WIDEST_ROW).map((item) => <ItemCard key={item.id} item={item} to={itemPath(item)} extra={extraOf?.(item)} />)}
          </Box>
        )}
    </Stack>
  );
};

export { Shelf };
export type { ShelfProps } from './Shelf.type';
