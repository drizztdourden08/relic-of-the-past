import type { InventoryCategory, InventorySlot } from '@shared/data/item-sprites';
import { INVENTORY_LAYOUT, resolveItemSprite } from '@shared/data/item-sprites';
import './TrackerView.css';

interface TrackerInventoryProps {
  inventory: Set<string>;
}

const SPRITE_BASE = '/sprites/items/';

export function TrackerInventory({ inventory }: TrackerInventoryProps) {
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

function TrackerInventorySlot({ slot, inventory }: { slot: InventorySlot; inventory: Set<string> }) {
  const { obtained, sprite } = resolveItemSprite(slot, inventory);
  return (
    <div className={`tracker-inventory__slot ${obtained ? 'tracker-inventory__slot--obtained' : 'tracker-inventory__slot--missing'}`}>
      <img
        className="tracker-inventory__sprite"
        src={`${SPRITE_BASE}${sprite}.png`}
        alt={slot.displayName}
        draggable={false}
      />
      <span className="tracker-inventory__name">{slot.displayName}</span>
    </div>
  );
}
