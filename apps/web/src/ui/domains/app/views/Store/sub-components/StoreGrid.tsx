/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { storeMediaUrl } from '@app/lib/store/store-site';
import { StoreItemCard } from '../../../compounds/StoreItemCard';
import type { StoreGridProps } from '../Store.type';

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
