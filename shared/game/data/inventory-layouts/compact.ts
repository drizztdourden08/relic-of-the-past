/* @layer shared-game @kind data */
import type { InventorySlot } from '../types/inventory';
import type { ItemId } from '../types';

const COMPACT_LAYOUT: InventorySlot[] = [
  // Swords
  { displayName: 'Fighter', trackerItemIds: ['item-074'], sprite: 'hud-fighter-sword' },
  { displayName: 'Master', trackerItemIds: ['item-002'], sprite: 'hud-master-sword' },
  { displayName: 'Tempered', trackerItemIds: ['item-003'], sprite: 'hud-tempered-sword' },
  { displayName: 'Golden', trackerItemIds: ['item-004'], sprite: 'hud-golden-sword' },
  // Shields
  { displayName: 'Fighter', trackerItemIds: ['item-005'], sprite: 'hud-fighters-shield' },
  { displayName: 'Fire', trackerItemIds: ['item-006'], sprite: 'hud-fire-shield' },
  { displayName: 'Mirror', trackerItemIds: ['item-007'], sprite: 'hud-mirror-shield' },
  // Armor
  { displayName: 'Blue Mail', trackerItemIds: ['item-035'], sprite: 'hud-blue-mail' },
  { displayName: 'Red Mail', trackerItemIds: ['item-036'], sprite: 'hud-red-mail' },
  // Gloves
  { displayName: 'Glove', trackerItemIds: ['item-028'], sprite: 'hud-power-glove' },
  { displayName: 'Mitts', trackerItemIds: ['item-029'], sprite: 'hud-titans-mitts' },
  // Bow
  { displayName: 'Bow', trackerItemIds: ['item-012'], sprite: 'hud-bow' },
  { displayName: 'Silver', trackerItemIds: ['item-060'], sprite: 'hud-silver-bow' },
  // Boomerang
  { displayName: 'Blue', trackerItemIds: ['item-013'], sprite: 'hud-blue-boomerang' },
  { displayName: 'Red', trackerItemIds: ['item-043'], sprite: 'hud-red-boomerang' },
  // Other weapons
  { displayName: 'Hookshot', trackerItemIds: ['item-011'], sprite: 'hud-hookshot' },
  { displayName: 'Bombs', trackerItemIds: ['item-041'], sprite: 'hud-bombs' },
  { displayName: 'Hammer', trackerItemIds: ['item-010'], sprite: 'hud-hammer' },
  // Rods
  { displayName: 'Fire Rod', trackerItemIds: ['item-008'], sprite: 'hud-fire-rod' },
  { displayName: 'Ice Rod', trackerItemIds: ['item-009'], sprite: 'hud-ice-rod' },
  // Medallions
  { displayName: 'Bombos', trackerItemIds: ['item-016'], sprite: 'hud-bombos' },
  { displayName: 'Ether', trackerItemIds: ['item-017'], sprite: 'hud-ether' },
  { displayName: 'Quake', trackerItemIds: ['item-018'], sprite: 'hud-quake' },
  // Magic items
  { displayName: 'Somaria', trackerItemIds: ['item-022'], sprite: 'hud-cane-of-somaria' },
  { displayName: 'Byrna', trackerItemIds: ['item-025'], sprite: 'hud-cane-of-byrna' },
  { displayName: 'Cape', trackerItemIds: ['item-026'], sprite: 'hud-cape' },
  { displayName: 'Mirror', trackerItemIds: ['item-027'], sprite: 'hud-magic-mirror' },
  // Other items
  { displayName: 'Powder', trackerItemIds: ['item-014', 'item-042'], sprite: 'hud-mushroom' },
  { displayName: 'Flute', trackerItemIds: ['item-075', 'item-021', 'item-020'], sprite: 'hud-shovel' },
  { displayName: 'Net', trackerItemIds: ['item-034'], sprite: 'hud-bug-net' },
  { displayName: 'Book', trackerItemIds: ['item-030'], sprite: 'hud-book-of-mudora' },
  // Passives
  { displayName: 'Boots', trackerItemIds: ['item-076'], sprite: 'hud-pegasus-boots' },
  { displayName: 'Flippers', trackerItemIds: ['item-031'], sprite: 'hud-flippers' },
  { displayName: 'Pearl', trackerItemIds: ['item-032'], sprite: 'hud-moon-pearl' },
];

export { COMPACT_LAYOUT };
