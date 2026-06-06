/* @layer shared-game @kind data */
import type { InventoryCategory } from './inventory-types';

const INVENTORY_LAYOUT: InventoryCategory[] = [
  {
    label: 'Weapons',
    items: [
      { displayName: 'Sword', trackerNames: ['Golden Sword', 'Tempered Sword', 'Master Sword', 'Fighter Sword'], sprite: 'hud-fighter-sword' },
      { displayName: 'Bow', trackerNames: ['Silver Bow', 'Bow'], sprite: 'hud-bow' },
      { displayName: 'Boomerang', trackerNames: ['Red Boomerang', 'Blue Boomerang'], sprite: 'hud-blue-boomerang' },
      { displayName: 'Hookshot', trackerNames: ['Hookshot'], sprite: 'hud-hookshot' },
      { displayName: 'Bombs', trackerNames: ['Bombs'], sprite: 'hud-bombs' },
      { displayName: 'Hammer', trackerNames: ['Hammer'], sprite: 'hud-hammer' },
    ],
  },
  {
    label: 'Rods & Magic',
    items: [
      { displayName: 'Fire Rod', trackerNames: ['Fire Rod'], sprite: 'hud-fire-rod' },
      { displayName: 'Ice Rod', trackerNames: ['Ice Rod'], sprite: 'hud-ice-rod' },
      { displayName: 'Bombos', trackerNames: ['Bombos'], sprite: 'hud-bombos' },
      { displayName: 'Ether', trackerNames: ['Ether'], sprite: 'hud-ether' },
      { displayName: 'Quake', trackerNames: ['Quake'], sprite: 'hud-quake' },
      { displayName: 'Lamp', trackerNames: ['Lamp'], sprite: 'hud-lamp' },
      { displayName: 'Cane of Somaria', trackerNames: ['Cane of Somaria'], sprite: 'hud-cane-of-somaria' },
      { displayName: 'Cane of Byrna', trackerNames: ['Cane of Byrna'], sprite: 'hud-cane-of-byrna' },
      { displayName: 'Cape', trackerNames: ['Cape'], sprite: 'hud-cape' },
    ],
  },
  {
    label: 'Equipment',
    items: [
      { displayName: 'Shield', trackerNames: ['Mirror Shield', 'Fire Shield', 'Fighters Shield'], sprite: 'hud-fighters-shield' },
      { displayName: 'Armor', trackerNames: ['Red Mail', 'Blue Mail'], sprite: 'hud-green-mail' },
      { displayName: 'Gloves', trackerNames: ['Titans Mitts', 'Power Glove'], sprite: 'hud-power-glove' },
      { displayName: 'Boots', trackerNames: ['Pegasus Boots'], sprite: 'hud-pegasus-boots' },
      { displayName: 'Flippers', trackerNames: ['Flippers'], sprite: 'hud-flippers' },
      { displayName: 'Moon Pearl', trackerNames: ['Moon Pearl'], sprite: 'hud-moon-pearl' },
      { displayName: 'Mirror', trackerNames: ['Magic Mirror'], sprite: 'hud-magic-mirror' },
    ],
  },
  {
    label: 'Items',
    items: [
      { displayName: 'Mushroom', trackerNames: ['Magic Powder', 'Mushroom'], sprite: 'hud-mushroom' },
      { displayName: 'Flute', trackerNames: ['Activated Flute', 'Flute', 'Shovel'], sprite: 'hud-shovel' },
      { displayName: 'Bug Net', trackerNames: ['Bug Catching Net'], sprite: 'hud-bug-net' },
      { displayName: 'Book', trackerNames: ['Book of Mudora'], sprite: 'hud-book-of-mudora' },
      { displayName: 'Bottle', trackerNames: ['Bottle'], sprite: 'hud-bottle' },
    ],
  },
  {
    label: 'Progress',
    items: [
      { displayName: 'Green Pendant', trackerNames: ['Green Pendant'], sprite: 'hud-green-pendant' },
      { displayName: 'Red Pendant', trackerNames: ['Red Pendant'], sprite: 'hud-red-pendant' },
      { displayName: 'Blue Pendant', trackerNames: ['Blue Pendant'], sprite: 'hud-blue-pendant' },
      { displayName: 'Crystal 1', trackerNames: ['Crystal 1'], sprite: 'hud-crystal' },
      { displayName: 'Crystal 2', trackerNames: ['Crystal 2'], sprite: 'hud-crystal' },
      { displayName: 'Crystal 3', trackerNames: ['Crystal 3'], sprite: 'hud-crystal' },
      { displayName: 'Crystal 4', trackerNames: ['Crystal 4'], sprite: 'hud-crystal' },
      { displayName: 'Crystal 5', trackerNames: ['Crystal 5'], sprite: 'hud-crystal' },
      { displayName: 'Crystal 6', trackerNames: ['Crystal 6'], sprite: 'hud-crystal' },
      { displayName: 'Crystal 7', trackerNames: ['Crystal 7'], sprite: 'hud-crystal' },
    ],
  },
];

export { INVENTORY_LAYOUT };
