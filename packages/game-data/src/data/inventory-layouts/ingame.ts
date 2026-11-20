/* @layer shared-game @kind data */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { InventorySlot } from '../types/inventory';

const INGAME_ITEMS_GRID: InventorySlot[][] = [
  [
    { displayName: msg('game-labels:inv.name.bow'), trackerItemIds: ['item-060', 'item-012'], sprite: 'hud-bow' },
    {
      displayName: msg('game-labels:inv.name.boomerang'),
      trackerItemIds: ['item-043', 'item-013'],
      sprite: 'hud-blue-boomerang',
    },
    { displayName: msg('game-labels:inv.name.hookshot'), trackerItemIds: ['item-011'], sprite: 'hud-hookshot' },
    { displayName: msg('game-labels:inv.name.bombs'), trackerItemIds: ['item-041'], sprite: 'hud-bombs' },
  ],
  [
    {
      displayName: msg('game-labels:inv.name.powder'),
      trackerItemIds: ['item-014', 'item-042'],
      sprite: 'hud-mushroom',
    },
    { displayName: msg('game-labels:inv.name.fireRod'), trackerItemIds: ['item-008'], sprite: 'hud-fire-rod' },
    { displayName: msg('game-labels:inv.name.iceRod'), trackerItemIds: ['item-009'], sprite: 'hud-ice-rod' },
    { displayName: msg('game-labels:inv.name.bombos'), trackerItemIds: ['item-016'], sprite: 'hud-bombos' },
  ],
  [
    { displayName: msg('game-labels:inv.name.ether'), trackerItemIds: ['item-017'], sprite: 'hud-ether' },
    { displayName: msg('game-labels:inv.name.quake'), trackerItemIds: ['item-018'], sprite: 'hud-quake' },
    { displayName: msg('game-labels:inv.name.lamp'), trackerItemIds: ['item-019'], sprite: 'hud-lamp' },
    { displayName: msg('game-labels:inv.name.hammer'), trackerItemIds: ['item-010'], sprite: 'hud-hammer' },
  ],
  [
    {
      displayName: msg('game-labels:inv.name.flute'),
      trackerItemIds: ['item-075', 'item-021', 'item-020'],
      sprite: 'hud-shovel',
    },
    { displayName: msg('game-labels:inv.name.bugNet'), trackerItemIds: ['item-034'], sprite: 'hud-bug-net' },
    { displayName: msg('game-labels:inv.name.book'), trackerItemIds: ['item-030'], sprite: 'hud-book-of-mudora' },
    { displayName: msg('game-labels:inv.name.bottle'), trackerItemIds: ['item-023'], sprite: 'hud-bottle' },
  ],
  [
    { displayName: msg('game-labels:inv.name.somaria'), trackerItemIds: ['item-022'], sprite: 'hud-cane-of-somaria' },
    { displayName: msg('game-labels:inv.name.byrna'), trackerItemIds: ['item-025'], sprite: 'hud-cane-of-byrna' },
    { displayName: msg('game-labels:inv.name.cape'), trackerItemIds: ['item-026'], sprite: 'hud-cape' },
    { displayName: msg('game-labels:inv.name.mirror'), trackerItemIds: ['item-027'], sprite: 'hud-magic-mirror' },
  ],
];

const INGAME_EQUIPMENT: InventorySlot[] = [
  {
    displayName: msg('game-labels:inv.name.sword'),
    trackerItemIds: ['item-004', 'item-003', 'item-002', 'item-074'],
    sprite: 'hud-fighter-sword',
  },
  {
    displayName: msg('game-labels:inv.name.shield'),
    trackerItemIds: ['item-007', 'item-006', 'item-005'],
    sprite: 'hud-fighters-shield',
  },
  { displayName: msg('game-labels:inv.name.armor'), trackerItemIds: ['item-036', 'item-035'], sprite: 'hud-green-mail' },
];

const INGAME_PASSIVES: InventorySlot[] = [
  {
    displayName: msg('game-labels:inv.name.gloves'),
    trackerItemIds: ['item-029', 'item-028'],
    sprite: 'hud-power-glove',
  },
  { displayName: msg('game-labels:inv.name.boots'), trackerItemIds: ['item-076'], sprite: 'hud-pegasus-boots' },
  { displayName: msg('game-labels:inv.name.flippers'), trackerItemIds: ['item-031'], sprite: 'hud-flippers' },
  { displayName: msg('game-labels:inv.name.moonPearl'), trackerItemIds: ['item-032'], sprite: 'hud-moon-pearl' },
];

export { INGAME_EQUIPMENT, INGAME_ITEMS_GRID, INGAME_PASSIVES };
