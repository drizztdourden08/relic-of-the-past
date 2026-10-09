/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { COMPACT_LAYOUT } from '@rotp/game-data';
import type { InventoryViewProps } from '../TrackerInventory.type';
import { TrackerInventorySlot } from './TrackerInventorySlot';

const CompactInventory = ({ inventory }: InventoryViewProps) => {
  return (
    <Box className="tracker-inventory tracker-inventory--compact">
      <Box className="tracker-inventory__grid tracker-inventory__grid--compact">
        {COMPACT_LAYOUT.map((slot, i) => (
          <TrackerInventorySlot key={`${slot.displayName}-${i}`} slot={slot} inventory={inventory} />
        ))}
      </Box>
    </Box>
  );
};

export { CompactInventory };
