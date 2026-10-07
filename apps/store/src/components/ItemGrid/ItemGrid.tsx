/* @layer store-site @kind component */
/**
 * Items as a wrapping grid of cards, as many to a row as fit. Browse, the search and the
 * author page all lay their items out with it. `onOpen` hears a card being opened, for a
 * host that must react (the search ends itself).
 */
import type { MouseEvent } from 'react';
import { Box } from '@ds/primitives/Box';
import { EmptyState } from '@ds/primitives/EmptyState';
import type { ItemCardView } from '@shared/store/home-types';
import { ItemCard } from '../ItemCard/ItemCard';
import type { OwnedState } from '../ItemCard/ItemCard';
import './ItemGrid.css';

type ItemGridProps = {
  items: readonly ItemCardView[];
  itemPath: (item: ItemCardView) => string;
  selectedId?: string | null;
  ownedOf?: (item: ItemCardView) => OwnedState | null;
  emptyMessage: string;
  onOpen?: () => void;
};

const CARD_SELECTOR = '.item-card';

const ItemGrid = (props: ItemGridProps) => {
  const { items, itemPath, selectedId = null, ownedOf, emptyMessage, onOpen } = props;
  if (items.length === 0) return <EmptyState message={emptyMessage} className="item-grid__empty" />;
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (onOpen && (event.target as HTMLElement).closest(CARD_SELECTOR)) onOpen();
  };
  return (
    <Box className="item-grid" onClick={handleClick}>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} to={itemPath(item)} selected={item.id === selectedId} owned={ownedOf?.(item) ?? null} />
      ))}
    </Box>
  );
};

export { ItemGrid };
export type { ItemGridProps };
