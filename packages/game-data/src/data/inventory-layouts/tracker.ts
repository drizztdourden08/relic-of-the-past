/* @layer shared-game @kind data */
import type { InventoryCategory } from '../types/inventory';

const INVENTORY_LAYOUT: InventoryCategory[] = [
  {
    label: { key: 'game-labels:inv.category.weapons' },
    items: [
      {
        displayName: { key: 'game-labels:inv.name.sword' },
        trackerItemIds: ['item-004', 'item-003', 'item-002', 'item-074'],
        sprite: 'hud-fighter-sword',
      },
      { displayName: { key: 'game-labels:inv.name.bow' }, trackerItemIds: ['item-060', 'item-012'], sprite: 'hud-bow' },
      {
        displayName: { key: 'game-labels:inv.name.boomerang' },
        trackerItemIds: ['item-043', 'item-013'],
        sprite: 'hud-blue-boomerang',
      },
      { displayName: { key: 'game-labels:inv.name.hookshot' }, trackerItemIds: ['item-011'], sprite: 'hud-hookshot' },
      { displayName: { key: 'game-labels:inv.name.bombs' }, trackerItemIds: ['item-041'], sprite: 'hud-bombs' },
      { displayName: { key: 'game-labels:inv.name.hammer' }, trackerItemIds: ['item-010'], sprite: 'hud-hammer' },
    ],
  },
  {
    label: { key: 'game-labels:inv.category.rods' },
    items: [
      { displayName: { key: 'game-labels:inv.name.fireRod' }, trackerItemIds: ['item-008'], sprite: 'hud-fire-rod' },
      { displayName: { key: 'game-labels:inv.name.iceRod' }, trackerItemIds: ['item-009'], sprite: 'hud-ice-rod' },
      { displayName: { key: 'game-labels:inv.name.bombos' }, trackerItemIds: ['item-016'], sprite: 'hud-bombos' },
      { displayName: { key: 'game-labels:inv.name.ether' }, trackerItemIds: ['item-017'], sprite: 'hud-ether' },
      { displayName: { key: 'game-labels:inv.name.quake' }, trackerItemIds: ['item-018'], sprite: 'hud-quake' },
      { displayName: { key: 'game-labels:inv.name.lamp' }, trackerItemIds: ['item-019'], sprite: 'hud-lamp' },
      {
        displayName: { key: 'game-labels:inv.name.caneSomaria' },
        trackerItemIds: ['item-022'],
        sprite: 'hud-cane-of-somaria',
      },
      {
        displayName: { key: 'game-labels:inv.name.caneByrna' },
        trackerItemIds: ['item-025'],
        sprite: 'hud-cane-of-byrna',
      },
      { displayName: { key: 'game-labels:inv.name.cape' }, trackerItemIds: ['item-026'], sprite: 'hud-cape' },
    ],
  },
  {
    label: { key: 'game-labels:inv.category.equipment' },
    items: [
      {
        displayName: { key: 'game-labels:inv.name.shield' },
        trackerItemIds: ['item-007', 'item-006', 'item-005'],
        sprite: 'hud-fighters-shield',
      },
      {
        displayName: { key: 'game-labels:inv.name.armor' },
        trackerItemIds: ['item-036', 'item-035'],
        sprite: 'hud-green-mail',
      },
      {
        displayName: { key: 'game-labels:inv.name.gloves' },
        trackerItemIds: ['item-029', 'item-028'],
        sprite: 'hud-power-glove',
      },
      { displayName: { key: 'game-labels:inv.name.boots' }, trackerItemIds: ['item-076'], sprite: 'hud-pegasus-boots' },
      { displayName: { key: 'game-labels:inv.name.flippers' }, trackerItemIds: ['item-031'], sprite: 'hud-flippers' },
      { displayName: { key: 'game-labels:inv.name.moonPearl' }, trackerItemIds: ['item-032'], sprite: 'hud-moon-pearl' },
      { displayName: { key: 'game-labels:inv.name.mirror' }, trackerItemIds: ['item-027'], sprite: 'hud-magic-mirror' },
    ],
  },
  {
    label: { key: 'game-labels:inv.category.items' },
    items: [
      {
        displayName: { key: 'game-labels:inv.name.mushroom' },
        trackerItemIds: ['item-014', 'item-042'],
        sprite: 'hud-mushroom',
      },
      {
        displayName: { key: 'game-labels:inv.name.flute' },
        trackerItemIds: ['item-075', 'item-021', 'item-020'],
        sprite: 'hud-shovel',
      },
      { displayName: { key: 'game-labels:inv.name.bugNet' }, trackerItemIds: ['item-034'], sprite: 'hud-bug-net' },
      { displayName: { key: 'game-labels:inv.name.book' }, trackerItemIds: ['item-030'], sprite: 'hud-book-of-mudora' },
      { displayName: { key: 'game-labels:inv.name.bottle' }, trackerItemIds: ['item-023'], sprite: 'hud-bottle' },
    ],
  },
  {
    label: { key: 'game-labels:inv.category.progress' },
    items: [
      {
        displayName: { key: 'game-labels:inv.name.greenPendant' },
        trackerItemIds: ['item-056'],
        sprite: 'hud-green-pendant',
      },
      { displayName: { key: 'game-labels:inv.name.redPendant' }, trackerItemIds: ['item-057'], sprite: 'hud-red-pendant' },
      {
        displayName: { key: 'game-labels:inv.name.bluePendant' },
        trackerItemIds: ['item-058'],
        sprite: 'hud-blue-pendant',
      },
      { displayName: { key: 'game-labels:inv.name.crystal', values: { n: 1 } }, trackerItemIds: ['item-112'], sprite: 'hud-crystal' },
      { displayName: { key: 'game-labels:inv.name.crystal', values: { n: 2 } }, trackerItemIds: ['item-113'], sprite: 'hud-crystal' },
      { displayName: { key: 'game-labels:inv.name.crystal', values: { n: 3 } }, trackerItemIds: ['item-114'], sprite: 'hud-crystal' },
      { displayName: { key: 'game-labels:inv.name.crystal', values: { n: 4 } }, trackerItemIds: ['item-115'], sprite: 'hud-crystal' },
      { displayName: { key: 'game-labels:inv.name.crystal', values: { n: 5 } }, trackerItemIds: ['item-116'], sprite: 'hud-crystal' },
      { displayName: { key: 'game-labels:inv.name.crystal', values: { n: 6 } }, trackerItemIds: ['item-117'], sprite: 'hud-crystal' },
      { displayName: { key: 'game-labels:inv.name.crystal', values: { n: 7 } }, trackerItemIds: ['item-118'], sprite: 'hud-crystal' },
    ],
  },
];

export { INVENTORY_LAYOUT };
