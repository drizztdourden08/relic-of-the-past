/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives';
import { INGAME_ITEMS_GRID, INGAME_EQUIPMENT, INGAME_PASSIVES } from '@shared/game/data';
import type { InventoryViewProps } from '../TrackerInventory.type';
import { TrackerInventorySlot } from './TrackerInventorySlot';

const IngameInventory = ({ inventory }: InventoryViewProps) => {
  return (
    <Box className="tracker-inventory tracker-inventory--ingame">
      <Box className="tracker-inventory__ingame-main">
        {INGAME_ITEMS_GRID.map((row, ri) => (
          <Box key={ri} className="tracker-inventory__ingame-row">
            {row.map((slot) => (
              <TrackerInventorySlot key={slot.displayName} slot={slot} inventory={inventory} />
            ))}
          </Box>
        ))}
      </Box>
      <Box className="tracker-inventory__ingame-side">
        {INGAME_EQUIPMENT.map((slot) => (
          <TrackerInventorySlot key={slot.displayName} slot={slot} inventory={inventory} />
        ))}
      </Box>
      <Box className="tracker-inventory__ingame-bottom">
        {INGAME_PASSIVES.map((slot) => (
          <TrackerInventorySlot key={slot.displayName} slot={slot} inventory={inventory} />
        ))}
      </Box>
    </Box>
  );
};

export { IngameInventory };
