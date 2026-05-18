import type { InventorySlot } from './inventory-types';

export const INGAME_ITEMS_GRID: InventorySlot[][] = [
  // Row 1
  [
    { displayName: 'Bow', trackerNames: ['Silver Bow', 'Bow'], sprite: 'hud-bow' },
    { displayName: 'Boomerang', trackerNames: ['Red Boomerang', 'Blue Boomerang'], sprite: 'hud-blue-boomerang' },
    { displayName: 'Hookshot', trackerNames: ['Hookshot'], sprite: 'hud-hookshot' },
    { displayName: 'Bombs', trackerNames: ['Bombs'], sprite: 'hud-bombs' },
  ],
  // Row 2
  [
    { displayName: 'Powder', trackerNames: ['Magic Powder', 'Mushroom'], sprite: 'hud-mushroom' },
    { displayName: 'Fire Rod', trackerNames: ['Fire Rod'], sprite: 'hud-fire-rod' },
    { displayName: 'Ice Rod', trackerNames: ['Ice Rod'], sprite: 'hud-ice-rod' },
    { displayName: 'Bombos', trackerNames: ['Bombos'], sprite: 'hud-bombos' },
  ],
  // Row 3
  [
    { displayName: 'Ether', trackerNames: ['Ether'], sprite: 'hud-ether' },
    { displayName: 'Quake', trackerNames: ['Quake'], sprite: 'hud-quake' },
    { displayName: 'Lamp', trackerNames: ['Lamp'], sprite: 'hud-lamp' },
    { displayName: 'Hammer', trackerNames: ['Hammer'], sprite: 'hud-hammer' },
  ],
  // Row 4
  [
    { displayName: 'Flute', trackerNames: ['Activated Flute', 'Flute', 'Shovel'], sprite: 'hud-shovel' },
    { displayName: 'Bug Net', trackerNames: ['Bug Catching Net'], sprite: 'hud-bug-net' },
    { displayName: 'Book', trackerNames: ['Book of Mudora'], sprite: 'hud-book-of-mudora' },
    { displayName: 'Bottle', trackerNames: ['Bottle'], sprite: 'hud-bottle' },
  ],
  // Row 5
  [
    { displayName: 'Somaria', trackerNames: ['Cane of Somaria'], sprite: 'hud-cane-of-somaria' },
    { displayName: 'Byrna', trackerNames: ['Cane of Byrna'], sprite: 'hud-cane-of-byrna' },
    { displayName: 'Cape', trackerNames: ['Cape'], sprite: 'hud-cape' },
    { displayName: 'Mirror', trackerNames: ['Magic Mirror'], sprite: 'hud-magic-mirror' },
  ],
];

export const INGAME_EQUIPMENT: InventorySlot[] = [
  { displayName: 'Sword', trackerNames: ['Golden Sword', 'Tempered Sword', 'Master Sword', 'Fighter Sword'], sprite: 'hud-fighter-sword' },
  { displayName: 'Shield', trackerNames: ['Mirror Shield', 'Fire Shield', 'Fighters Shield'], sprite: 'hud-fighters-shield' },
  { displayName: 'Armor', trackerNames: ['Red Mail', 'Blue Mail'], sprite: 'hud-green-mail' },
];

export const INGAME_PASSIVES: InventorySlot[] = [
  { displayName: 'Gloves', trackerNames: ['Titans Mitts', 'Power Glove'], sprite: 'hud-power-glove' },
  { displayName: 'Boots', trackerNames: ['Pegasus Boots'], sprite: 'hud-pegasus-boots' },
  { displayName: 'Flippers', trackerNames: ['Flippers'], sprite: 'hud-flippers' },
  { displayName: 'Moon Pearl', trackerNames: ['Moon Pearl'], sprite: 'hud-moon-pearl' },
];
