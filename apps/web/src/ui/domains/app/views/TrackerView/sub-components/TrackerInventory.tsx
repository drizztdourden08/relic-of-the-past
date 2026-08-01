/* @layer renderer-components @kind component */
import { Box, Text, Image } from '../../../../../design-system/primitives';
import type { InventoryCategory, InventorySlot, InventoryViewMode, ItemId } from '@shared/game/data';
import {
  INVENTORY_LAYOUT, INGAME_ITEMS_GRID, INGAME_EQUIPMENT, INGAME_PASSIVES, COMPACT_LAYOUT,
} from '@shared/game/data';
import { resolveItemSprite, getSpritesBase } from '@shared/game/logic/queries/item-sprites';
import '../TrackerView.css';

interface TrackerInventoryProps {
  inventory: ReadonlySet<ItemId>;
  viewMode?: InventoryViewMode;
}

const TrackerInventory = (props: TrackerInventoryProps) => {
  const { inventory, viewMode = 'default' } = props;
  if (viewMode === 'ingame') return <IngameInventory inventory={inventory} />;
  if (viewMode === 'compact') return <CompactInventory inventory={inventory} />;
  return <DefaultInventory inventory={inventory} />;
}

// ─── Default view (categorized) ───

const DefaultInventory = ({ inventory }: { inventory: ReadonlySet<ItemId> }) => {
  return (
    <Box className="tracker-inventory">
      {INVENTORY_LAYOUT.map((category) => (
        <TrackerInventoryCategory key={category.label} category={category} inventory={inventory} />
      ))}
    </Box>
  );
};

const TrackerInventoryCategory = ({ category, inventory }: { category: InventoryCategory; inventory: ReadonlySet<ItemId> }) => {
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

// ─── In-game view (matches SNES pause screen layout) ───

const IngameInventory = ({ inventory }: { inventory: ReadonlySet<ItemId> }) => {
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

// ─── Compact view (flat grid, upgrades broken down) ───

const CompactInventory = ({ inventory }: { inventory: ReadonlySet<ItemId> }) => {
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

// ─── Shared slot renderer ───

const TrackerInventorySlot = ({ slot, inventory }: { slot: InventorySlot; inventory: ReadonlySet<ItemId> }) => {
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

export { TrackerInventory };
