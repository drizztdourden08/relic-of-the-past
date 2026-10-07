/* @layer renderer-components @kind component */
/** A grid of item cards, as wide columns as the pane allows. Shared by the shelves and Browse. */
import { Box } from '@ds/primitives';
import type { ItemCardView } from '@shared/store/home-types';
import { storeMediaUrl } from '@app/lib/store/store-site';
import { StoreItemCard } from '../../../compounds/StoreItemCard';
import type { StoreItemStatus } from '../../../compounds/StoreItemCard';

interface StoreGridProps {
  items: ItemCardView[];
  statusFor: (item: ItemCardView) => StoreItemStatus;
  selectedId: string | null;
  onSelect: (itemId: string) => void;
}

const StoreGrid = (props: StoreGridProps) => {
  const { items, statusFor, selectedId, onSelect } = props;

  return (
    <Box className="store-grid">
      {items.map((item) => (
        <StoreItemCard
          key={item.id}
          item={item}
          imageUrl={storeMediaUrl(item.card)}
          status={statusFor(item)}
          selected={item.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </Box>
  );
};

export { StoreGrid };
export type { StoreGridProps };
