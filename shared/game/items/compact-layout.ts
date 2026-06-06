/* @layer shared-game @kind logic */
import type { InventorySlot } from './inventory-types';

const COMPACT_LAYOUT: InventorySlot[] = [
  // Swords
  { displayName: 'Fighter', trackerNames: ['Fighter Sword'], sprite: 'hud-fighter-sword' },
  { displayName: 'Master', trackerNames: ['Master Sword'], sprite: 'hud-master-sword' },
  { displayName: 'Tempered', trackerNames: ['Tempered Sword'], sprite: 'hud-tempered-sword' },
  { displayName: 'Golden', trackerNames: ['Golden Sword'], sprite: 'hud-golden-sword' },
  // Shields
  { displayName: 'Fighter', trackerNames: ['Fighters Shield'], sprite: 'hud-fighters-shield' },
  { displayName: 'Fire', trackerNames: ['Fire Shield'], sprite: 'hud-fire-shield' },
  { displayName: 'Mirror', trackerNames: ['Mirror Shield'], sprite: 'hud-mirror-shield' },
  // Armor
  { displayName: 'Blue Mail', trackerNames: ['Blue Mail'], sprite: 'hud-blue-mail' },
  { displayName: 'Red Mail', trackerNames: ['Red Mail'], sprite: 'hud-red-mail' },
  // Gloves
  { displayName: 'Glove', trackerNames: ['Power Glove'], sprite: 'hud-power-glove' },
  { displayName: 'Mitts', trackerNames: ['Titans Mitts'], sprite: 'hud-titans-mitts' },
  // Bow
  { displayName: 'Bow', trackerNames: ['Bow'], sprite: 'hud-bow' },
  { displayName: 'Silver', trackerNames: ['Silver Bow'], sprite: 'hud-silver-bow' },
  // Boomerang
  { displayName: 'Blue', trackerNames: ['Blue Boomerang'], sprite: 'hud-blue-boomerang' },
  { displayName: 'Red', trackerNames: ['Red Boomerang'], sprite: 'hud-red-boomerang' },
  // Other weapons
  { displayName: 'Hookshot', trackerNames: ['Hookshot'], sprite: 'hud-hookshot' },
  { displayName: 'Bombs', trackerNames: ['Bombs'], sprite: 'hud-bombs' },
  { displayName: 'Hammer', trackerNames: ['Hammer'], sprite: 'hud-hammer' },
  // Rods
  { displayName: 'Fire Rod', trackerNames: ['Fire Rod'], sprite: 'hud-fire-rod' },
  { displayName: 'Ice Rod', trackerNames: ['Ice Rod'], sprite: 'hud-ice-rod' },
  // Medallions
  { displayName: 'Bombos', trackerNames: ['Bombos'], sprite: 'hud-bombos' },
  { displayName: 'Ether', trackerNames: ['Ether'], sprite: 'hud-ether' },
  { displayName: 'Quake', trackerNames: ['Quake'], sprite: 'hud-quake' },
  // Magic items
  { displayName: 'Somaria', trackerNames: ['Cane of Somaria'], sprite: 'hud-cane-of-somaria' },
  { displayName: 'Byrna', trackerNames: ['Cane of Byrna'], sprite: 'hud-cane-of-byrna' },
  { displayName: 'Cape', trackerNames: ['Cape'], sprite: 'hud-cape' },
  { displayName: 'Mirror', trackerNames: ['Magic Mirror'], sprite: 'hud-magic-mirror' },
  // Other items
  { displayName: 'Powder', trackerNames: ['Magic Powder', 'Mushroom'], sprite: 'hud-mushroom' },
  { displayName: 'Flute', trackerNames: ['Activated Flute', 'Flute', 'Shovel'], sprite: 'hud-shovel' },
  { displayName: 'Net', trackerNames: ['Bug Catching Net'], sprite: 'hud-bug-net' },
  { displayName: 'Book', trackerNames: ['Book of Mudora'], sprite: 'hud-book-of-mudora' },
  // Passives
  { displayName: 'Boots', trackerNames: ['Pegasus Boots'], sprite: 'hud-pegasus-boots' },
  { displayName: 'Flippers', trackerNames: ['Flippers'], sprite: 'hud-flippers' },
  { displayName: 'Pearl', trackerNames: ['Moon Pearl'], sprite: 'hud-moon-pearl' },
];

export { COMPACT_LAYOUT };
