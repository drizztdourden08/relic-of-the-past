/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { InventoryCategoryProps } from '../TrackerInventory.type';
import { TrackerInventorySlot } from './TrackerInventorySlot';

const TrackerInventoryCategory = ({ category, inventory }: InventoryCategoryProps) => {
  return (
    <Box className="tracker-inventory__category">
      <Text className="tracker-inventory__category-label">{category.label}</Text>
      <Box className="tracker-inventory__grid">
        {category.items.map((slot) => (
          <TrackerInventorySlot key={slot.displayName} slot={slot} inventory={inventory} />
        ))}
      </Box>
    </Box>
  );
};

export { TrackerInventoryCategory };
