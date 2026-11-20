/* @layer shared-game @kind data */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { InventoryCategory } from '../types/inventory';

const INVENTORY_LAYOUT: InventoryCategory[] = [
  {
    label: msg('game-labels:inv.category.weapons'),
    items: [
      {
        displayName: msg('game-labels:inv.name.sword'),
        trackerItemIds: ['item-004', 'item-003', 'item-002', 'item-074'],
        sprite: 'hud-fighter-sword',
      },
      { displayName: msg('game-labels:inv.name.bow'), trackerItemIds: ['item-060', 'item-012'], sprite: 'hud-bow' },
      {
        displayName: msg('game-labels:inv.name.boomerang'),
        trackerItemIds: ['item-043', 'item-013'],
        sprite: 'hud-blue-boomerang',
      },
      { displayName: msg('game-labels:inv.name.hookshot'), trackerItemIds: ['item-011'], sprite: 'hud-hookshot' },
      { displayName: msg('game-labels:inv.name.bombs'), trackerItemIds: ['item-041'], sprite: 'hud-bombs' },
      { displayName: msg('game-labels:inv.name.hammer'), trackerItemIds: ['item-010'], sprite: 'hud-hammer' },
    ],
  },
  {
    label: msg('game-labels:inv.category.rods'),
    items: [
      { displayName: msg('game-labels:inv.name.fireRod'), trackerItemIds: ['item-008'], sprite: 'hud-fire-rod' },
      { displayName: msg('game-labels:inv.name.iceRod'), trackerItemIds: ['item-009'], sprite: 'hud-ice-rod' },
      { displayName: msg('game-labels:inv.name.bombos'), trackerItemIds: ['item-016'], sprite: 'hud-bombos' },
      { displayName: msg('game-labels:inv.name.ether'), trackerItemIds: ['item-017'], sprite: 'hud-ether' },
      { displayName: msg('game-labels:inv.name.quake'), trackerItemIds: ['item-018'], sprite: 'hud-quake' },
      { displayName: msg('game-labels:inv.name.lamp'), trackerItemIds: ['item-019'], sprite: 'hud-lamp' },
      {
        displayName: msg('game-labels:inv.name.caneSomaria'),
        trackerItemIds: ['item-022'],
        sprite: 'hud-cane-of-somaria',
      },
      {
        displayName: msg('game-labels:inv.name.caneByrna'),
        trackerItemIds: ['item-025'],
        sprite: 'hud-cane-of-byrna',
      },
      { displayName: msg('game-labels:inv.name.cape'), trackerItemIds: ['item-026'], sprite: 'hud-cape' },
    ],
  },
  {
    label: msg('game-labels:inv.category.equipment'),
    items: [
      {
        displayName: msg('game-labels:inv.name.shield'),
        trackerItemIds: ['item-007', 'item-006', 'item-005'],
        sprite: 'hud-fighters-shield',
      },
      {
        displayName: msg('game-labels:inv.name.armor'),
        trackerItemIds: ['item-036', 'item-035'],
        sprite: 'hud-green-mail',
      },
      {
        displayName: msg('game-labels:inv.name.gloves'),
        trackerItemIds: ['item-029', 'item-028'],
        sprite: 'hud-power-glove',
      },
      { displayName: msg('game-labels:inv.name.boots'), trackerItemIds: ['item-076'], sprite: 'hud-pegasus-boots' },
      { displayName: msg('game-labels:inv.name.flippers'), trackerItemIds: ['item-031'], sprite: 'hud-flippers' },
      { displayName: msg('game-labels:inv.name.moonPearl'), trackerItemIds: ['item-032'], sprite: 'hud-moon-pearl' },
      { displayName: msg('game-labels:inv.name.mirror'), trackerItemIds: ['item-027'], sprite: 'hud-magic-mirror' },
    ],
  },
  {
    label: msg('game-labels:inv.category.items'),
    items: [
      {
        displayName: msg('game-labels:inv.name.mushroom'),
        trackerItemIds: ['item-014', 'item-042'],
        sprite: 'hud-mushroom',
      },
      {
        displayName: msg('game-labels:inv.name.flute'),
        trackerItemIds: ['item-075', 'item-021', 'item-020'],
        sprite: 'hud-shovel',
      },
      { displayName: msg('game-labels:inv.name.bugNet'), trackerItemIds: ['item-034'], sprite: 'hud-bug-net' },
      { displayName: msg('game-labels:inv.name.book'), trackerItemIds: ['item-030'], sprite: 'hud-book-of-mudora' },
      { displayName: msg('game-labels:inv.name.bottle'), trackerItemIds: ['item-023'], sprite: 'hud-bottle' },
    ],
  },
  {
    label: msg('game-labels:inv.category.progress'),
    items: [
      {
        displayName: msg('game-labels:inv.name.greenPendant'),
        trackerItemIds: ['item-056'],
        sprite: 'hud-green-pendant',
      },
      { displayName: msg('game-labels:inv.name.redPendant'), trackerItemIds: ['item-057'], sprite: 'hud-red-pendant' },
      {
        displayName: msg('game-labels:inv.name.bluePendant'),
        trackerItemIds: ['item-058'],
        sprite: 'hud-blue-pendant',
      },
      { displayName: msg('game-labels:inv.name.crystal', { n: 1 }), trackerItemIds: ['item-112'], sprite: 'hud-crystal' },
      { displayName: msg('game-labels:inv.name.crystal', { n: 2 }), trackerItemIds: ['item-113'], sprite: 'hud-crystal' },
      { displayName: msg('game-labels:inv.name.crystal', { n: 3 }), trackerItemIds: ['item-114'], sprite: 'hud-crystal' },
      { displayName: msg('game-labels:inv.name.crystal', { n: 4 }), trackerItemIds: ['item-115'], sprite: 'hud-crystal' },
      { displayName: msg('game-labels:inv.name.crystal', { n: 5 }), trackerItemIds: ['item-116'], sprite: 'hud-crystal' },
      { displayName: msg('game-labels:inv.name.crystal', { n: 6 }), trackerItemIds: ['item-117'], sprite: 'hud-crystal' },
      { displayName: msg('game-labels:inv.name.crystal', { n: 7 }), trackerItemIds: ['item-118'], sprite: 'hud-crystal' },
    ],
  },
];

export { INVENTORY_LAYOUT };
