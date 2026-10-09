/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { INVENTORY_LAYOUT } from '@shared/game/data';
import type { InventoryViewProps } from '../TrackerInventory.type';
import { TrackerInventoryCategory } from './TrackerInventoryCategory';

const DefaultInventory = ({ inventory }: InventoryViewProps) => {
  return (
    <Box className="tracker-inventory">
      {INVENTORY_LAYOUT.map((category) => (
        <TrackerInventoryCategory key={category.label} category={category} inventory={inventory} />
      ))}
    </Box>
  );
};

export { DefaultInventory };
