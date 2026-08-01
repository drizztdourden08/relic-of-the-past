/* @layer shared-game @kind data */
import type { InventoryCategory } from '../types/inventory';
import type { ItemId } from '../types';

const INVENTORY_LAYOUT: InventoryCategory[] = [
  {
    label: 'Weapons',
    items: [
      { displayName: 'Sword', trackerItemIds: ['item-004', 'item-003', 'item-002', 'item-074'], sprite: 'hud-fighter-sword' },
      { displayName: 'Bow', trackerItemIds: ['item-060', 'item-012'], sprite: 'hud-bow' },
      { displayName: 'Boomerang', trackerItemIds: ['item-043', 'item-013'], sprite: 'hud-blue-boomerang' },
      { displayName: 'Hookshot', trackerItemIds: ['item-011'], sprite: 'hud-hookshot' },
      { displayName: 'Bombs', trackerItemIds: ['item-041'], sprite: 'hud-bombs' },
      { displayName: 'Hammer', trackerItemIds: ['item-010'], sprite: 'hud-hammer' },
    ],
  },
  {
    label: 'Rods & Magic',
    items: [
      { displayName: 'Fire Rod', trackerItemIds: ['item-008'], sprite: 'hud-fire-rod' },
      { displayName: 'Ice Rod', trackerItemIds: ['item-009'], sprite: 'hud-ice-rod' },
      { displayName: 'Bombos', trackerItemIds: ['item-016'], sprite: 'hud-bombos' },
      { displayName: 'Ether', trackerItemIds: ['item-017'], sprite: 'hud-ether' },
      { displayName: 'Quake', trackerItemIds: ['item-018'], sprite: 'hud-quake' },
      { displayName: 'Lamp', trackerItemIds: ['item-019'], sprite: 'hud-lamp' },
      { displayName: 'Cane of Somaria', trackerItemIds: ['item-022'], sprite: 'hud-cane-of-somaria' },
      { displayName: 'Cane of Byrna', trackerItemIds: ['item-025'], sprite: 'hud-cane-of-byrna' },
      { displayName: 'Cape', trackerItemIds: ['item-026'], sprite: 'hud-cape' },
    ],
  },
  {
    label: 'Equipment',
    items: [
      { displayName: 'Shield', trackerItemIds: ['item-007', 'item-006', 'item-005'], sprite: 'hud-fighters-shield' },
      { displayName: 'Armor', trackerItemIds: ['item-036', 'item-035'], sprite: 'hud-green-mail' },
      { displayName: 'Gloves', trackerItemIds: ['item-029', 'item-028'], sprite: 'hud-power-glove' },
      { displayName: 'Boots', trackerItemIds: ['item-076'], sprite: 'hud-pegasus-boots' },
      { displayName: 'Flippers', trackerItemIds: ['item-031'], sprite: 'hud-flippers' },
      { displayName: 'Moon Pearl', trackerItemIds: ['item-032'], sprite: 'hud-moon-pearl' },
      { displayName: 'Mirror', trackerItemIds: ['item-027'], sprite: 'hud-magic-mirror' },
    ],
  },
  {
    label: 'Items',
    items: [
      { displayName: 'Mushroom', trackerItemIds: ['item-014', 'item-042'], sprite: 'hud-mushroom' },
      { displayName: 'Flute', trackerItemIds: ['item-075', 'item-021', 'item-020'], sprite: 'hud-shovel' },
      { displayName: 'Bug Net', trackerItemIds: ['item-034'], sprite: 'hud-bug-net' },
      { displayName: 'Book', trackerItemIds: ['item-030'], sprite: 'hud-book-of-mudora' },
      { displayName: 'Bottle', trackerItemIds: ['item-023'], sprite: 'hud-bottle' },
    ],
  },
  {
    label: 'Progress',
    items: [
      { displayName: 'Green Pendant', trackerItemIds: ['item-109'], sprite: 'hud-green-pendant' },
      { displayName: 'Red Pendant', trackerItemIds: ['item-111'], sprite: 'hud-red-pendant' },
      { displayName: 'Blue Pendant', trackerItemIds: ['item-110'], sprite: 'hud-blue-pendant' },
      { displayName: 'Crystal 1', trackerItemIds: ['item-112'], sprite: 'hud-crystal' },
      { displayName: 'Crystal 2', trackerItemIds: ['item-113'], sprite: 'hud-crystal' },
      { displayName: 'Crystal 3', trackerItemIds: ['item-114'], sprite: 'hud-crystal' },
      { displayName: 'Crystal 4', trackerItemIds: ['item-115'], sprite: 'hud-crystal' },
      { displayName: 'Crystal 5', trackerItemIds: ['item-116'], sprite: 'hud-crystal' },
      { displayName: 'Crystal 6', trackerItemIds: ['item-117'], sprite: 'hud-crystal' },
      { displayName: 'Crystal 7', trackerItemIds: ['item-118'], sprite: 'hud-crystal' },
    ],
  },
];

export { INVENTORY_LAYOUT };
