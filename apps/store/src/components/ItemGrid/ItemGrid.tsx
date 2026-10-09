/* @layer store-site @kind component */
import type { MouseEvent } from 'react';
import { Box } from '@ds/primitives/Box';
import { EmptyState } from '@ds/primitives/EmptyState';
import { ItemCard } from '../ItemCard/ItemCard';
import type { ItemGridProps } from './ItemGrid.type';
import { CARD_SELECTOR } from './ItemGrid.constants';
import './ItemGrid.css';

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
export type { ItemGridProps } from './ItemGrid.type';
