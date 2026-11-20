/* @layer shared-game @kind data */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { InventorySlot } from '../types/inventory';

const COMPACT_LAYOUT: InventorySlot[] = [
  { displayName: msg('game-labels:inv.name.swordFighter'), trackerItemIds: ['item-074'], sprite: 'hud-fighter-sword' },
  { displayName: msg('game-labels:inv.name.swordMaster'), trackerItemIds: ['item-002'], sprite: 'hud-master-sword' },
  { displayName: msg('game-labels:inv.name.swordTempered'), trackerItemIds: ['item-003'], sprite: 'hud-tempered-sword' },
  { displayName: msg('game-labels:inv.name.swordGolden'), trackerItemIds: ['item-004'], sprite: 'hud-golden-sword' },
  { displayName: msg('game-labels:inv.name.shieldFighter'), trackerItemIds: ['item-005'], sprite: 'hud-fighters-shield' },
  { displayName: msg('game-labels:inv.name.shieldFire'), trackerItemIds: ['item-006'], sprite: 'hud-fire-shield' },
  { displayName: msg('game-labels:inv.name.shieldMirror'), trackerItemIds: ['item-007'], sprite: 'hud-mirror-shield' },
  { displayName: msg('game-labels:inv.name.mailBlue'), trackerItemIds: ['item-035'], sprite: 'hud-blue-mail' },
  { displayName: msg('game-labels:inv.name.mailRed'), trackerItemIds: ['item-036'], sprite: 'hud-red-mail' },
  { displayName: msg('game-labels:inv.name.glove'), trackerItemIds: ['item-028'], sprite: 'hud-power-glove' },
  { displayName: msg('game-labels:inv.name.mitts'), trackerItemIds: ['item-029'], sprite: 'hud-titans-mitts' },
  { displayName: msg('game-labels:inv.name.bow'), trackerItemIds: ['item-012'], sprite: 'hud-bow' },
  { displayName: msg('game-labels:inv.name.bowSilver'), trackerItemIds: ['item-060'], sprite: 'hud-silver-bow' },
  {
    displayName: msg('game-labels:inv.name.boomerangBlue'),
    trackerItemIds: ['item-013'],
    sprite: 'hud-blue-boomerang',
  },
  {
    displayName: msg('game-labels:inv.name.boomerangRed'),
    trackerItemIds: ['item-043'],
    sprite: 'hud-red-boomerang',
  },
  { displayName: msg('game-labels:inv.name.hookshot'), trackerItemIds: ['item-011'], sprite: 'hud-hookshot' },
  { displayName: msg('game-labels:inv.name.bombs'), trackerItemIds: ['item-041'], sprite: 'hud-bombs' },
  { displayName: msg('game-labels:inv.name.hammer'), trackerItemIds: ['item-010'], sprite: 'hud-hammer' },
  { displayName: msg('game-labels:inv.name.fireRod'), trackerItemIds: ['item-008'], sprite: 'hud-fire-rod' },
  { displayName: msg('game-labels:inv.name.iceRod'), trackerItemIds: ['item-009'], sprite: 'hud-ice-rod' },
  { displayName: msg('game-labels:inv.name.bombos'), trackerItemIds: ['item-016'], sprite: 'hud-bombos' },
  { displayName: msg('game-labels:inv.name.ether'), trackerItemIds: ['item-017'], sprite: 'hud-ether' },
  { displayName: msg('game-labels:inv.name.quake'), trackerItemIds: ['item-018'], sprite: 'hud-quake' },
  { displayName: msg('game-labels:inv.name.somaria'), trackerItemIds: ['item-022'], sprite: 'hud-cane-of-somaria' },
  { displayName: msg('game-labels:inv.name.byrna'), trackerItemIds: ['item-025'], sprite: 'hud-cane-of-byrna' },
  { displayName: msg('game-labels:inv.name.cape'), trackerItemIds: ['item-026'], sprite: 'hud-cape' },
  { displayName: msg('game-labels:inv.name.mirror'), trackerItemIds: ['item-027'], sprite: 'hud-magic-mirror' },
  { displayName: msg('game-labels:inv.name.powder'), trackerItemIds: ['item-014', 'item-042'], sprite: 'hud-mushroom' },
  {
    displayName: msg('game-labels:inv.name.flute'),
    trackerItemIds: ['item-075', 'item-021', 'item-020'],
    sprite: 'hud-shovel',
  },
  { displayName: msg('game-labels:inv.name.net'), trackerItemIds: ['item-034'], sprite: 'hud-bug-net' },
  { displayName: msg('game-labels:inv.name.book'), trackerItemIds: ['item-030'], sprite: 'hud-book-of-mudora' },
  { displayName: msg('game-labels:inv.name.boots'), trackerItemIds: ['item-076'], sprite: 'hud-pegasus-boots' },
  { displayName: msg('game-labels:inv.name.flippers'), trackerItemIds: ['item-031'], sprite: 'hud-flippers' },
  { displayName: msg('game-labels:inv.name.pearl'), trackerItemIds: ['item-032'], sprite: 'hud-moon-pearl' },
];

export { COMPACT_LAYOUT };
