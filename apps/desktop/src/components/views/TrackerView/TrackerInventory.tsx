import type { InventoryCategory, InventorySlot, InventoryViewMode } from '@shared/data/item-sprites';
import {
  INVENTORY_LAYOUT, INGAME_ITEMS_GRID, INGAME_EQUIPMENT, INGAME_PASSIVES, COMPACT_LAYOUT,
  resolveItemSprite, getSpritesBase,
} from '@shared/data/item-sprites';
import './TrackerView.css';

interface TrackerInventoryProps {
  inventory: Set<string>;
  viewMode?: InventoryViewMode;
}

export function TrackerInventory({ inventory, viewMode = 'default' }: TrackerInventoryProps) {
  if (viewMode === 'ingame') return <IngameInventory inventory={inventory} />;
  if (viewMode === 'compact') return <CompactInventory inventory={inventory} />;
  return <DefaultInventory inventory={inventory} />;
}

// ─── Default view (categorized) ───

function DefaultInventory({ inventory }: { inventory: Set<string> }) {
  return (
    <div className="tracker-inventory">
      {INVENTORY_LAYOUT.map((category) => (
        <TrackerInventoryCategory key={category.label} category={category} inventory={inventory} />
      ))}
    </div>
  );
}

function TrackerInventoryCategory({ category, inventory }: { category: InventoryCategory; inventory: Set<string> }) {
  return (
    <div className="tracker-inventory__category">
      <span className="tracker-inventory__category-label">{category.label}</span>
      <div className="tracker-inventory__grid">
        {category.items.map((slot) => (
          <TrackerInventorySlot key={slot.displayName} slot={slot} inventory={inventory} />
        ))}
      </div>
    </div>
  );
}

// ─── In-game view (matches SNES pause screen layout) ───

function IngameInventory({ inventory }: { inventory: Set<string> }) {
  return (
    <div className="tracker-inventory tracker-inventory--ingame">
      <div className="tracker-inventory__ingame-main">
        {INGAME_ITEMS_GRID.map((row, ri) => (
          <div key={ri} className="tracker-inventory__ingame-row">
            {row.map((slot) => (
              <TrackerInventorySlot key={slot.displayName} slot={slot} inventory={inventory} />
            ))}
          </div>
        ))}
      </div>
      <div className="tracker-inventory__ingame-side">
        {INGAME_EQUIPMENT.map((slot) => (
          <TrackerInventorySlot key={slot.displayName} slot={slot} inventory={inventory} />
        ))}
      </div>
      <div className="tracker-inventory__ingame-bottom">
        {INGAME_PASSIVES.map((slot) => (
          <TrackerInventorySlot key={slot.displayName} slot={slot} inventory={inventory} />
        ))}
      </div>
    </div>
  );
}

// ─── Compact view (flat grid, upgrades broken down) ───

function CompactInventory({ inventory }: { inventory: Set<string> }) {
  return (
    <div className="tracker-inventory tracker-inventory--compact">
      <div className="tracker-inventory__grid tracker-inventory__grid--compact">
        {COMPACT_LAYOUT.map((slot, i) => (
          <TrackerInventorySlot key={`${slot.displayName}-${i}`} slot={slot} inventory={inventory} />
        ))}
      </div>
    </div>
  );
}

// ─── Shared slot renderer ───

function TrackerInventorySlot({ slot, inventory }: { slot: InventorySlot; inventory: Set<string> }) {
  const { obtained, sprite } = resolveItemSprite(slot, inventory);
  return (
    <div className={`tracker-inventory__slot ${obtained ? 'tracker-inventory__slot--obtained' : 'tracker-inventory__slot--missing'}`}>
      <img
        className="tracker-inventory__sprite"
        src={`${getSpritesBase()}${sprite}.png`}
        alt={slot.displayName}
        draggable={false}
      />
      <span className="tracker-inventory__name">{slot.displayName}</span>
    </div>
  );
}
