/* @layer renderer-components @kind component */
import { Box, Text, Image } from '@drizztdourden08/tessera/primitives';
import { resolveItemSprite, getSpritesBase } from '@rotp/game-data';
import type { InventorySlotProps } from '../TrackerInventory.type';

const TrackerInventorySlot = ({ slot, inventory }: InventorySlotProps) => {
  const { obtained, sprite } = resolveItemSprite(slot, inventory);
  return (
    <Box className={`tracker-inventory__slot ${obtained ? 'tracker-inventory__slot--obtained' : 'tracker-inventory__slot--missing'}`}>
      <Image
        className="tracker-inventory__sprite"
        src={`${getSpritesBase()}${sprite}.png`}
        alt={slot.displayName}
        draggable={false}
      />
      <Text className="tracker-inventory__name">{slot.displayName}</Text>
    </Box>
  );
};

export { TrackerInventorySlot };
