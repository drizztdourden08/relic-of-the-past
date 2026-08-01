/* @layer shared-game @kind data */
/** Further split by locality out of checks/{dungeons,light-world,dark-world}.ts — Package T. */
import type { CheckRecord } from '../../types';

const DW_DARK_DEATH_MOUNTAIN_CHECKS: CheckRecord[] = [
  {
    id: 'check-074',
    gameId: { roomId: 268, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-459',
    randomizerName: 'Mimic Cave',
    vanillaItemIds: ['item-024'],
  },
  {
    id: 'check-075',
    gameId: { roomId: 279, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-465',
    randomizerName: 'Spike Cave',
    vanillaItemIds: ['item-025'],
  },
  {
    id: 'check-091',
    gameId: { roomId: 248, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-463',
    randomizerName: 'Superbunny Cave - Top',
    vanillaItemIds: ['item-072'],
  },
  {
    id: 'check-092',
    gameId: { roomId: 248, chestIndex: 1 },
    kind: 'chest',
    screenId: 'screen-457',
    randomizerName: 'Superbunny Cave - Bottom',
    vanillaItemIds: ['item-072'],
  },
  {
    id: 'check-093',
    gameId: { roomId: 60, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-464',
    randomizerName: 'Hookshot Cave - Top Right',
    vanillaItemIds: ['item-066'],
  },
  {
    id: 'check-094',
    gameId: { roomId: 60, chestIndex: 1 },
    kind: 'chest',
    screenId: 'screen-464',
    randomizerName: 'Hookshot Cave - Top Left',
    vanillaItemIds: ['item-066'],
  },
  {
    id: 'check-095',
    gameId: { roomId: 60, chestIndex: 2 },
    kind: 'chest',
    screenId: 'screen-464',
    randomizerName: 'Hookshot Cave - Bottom Right',
    vanillaItemIds: ['item-066'],
  },
  {
    id: 'check-096',
    gameId: { roomId: 60, chestIndex: 3 },
    kind: 'chest',
    screenId: 'screen-464',
    randomizerName: 'Hookshot Cave - Bottom Left',
    vanillaItemIds: ['item-066'],
  },
];

export { DW_DARK_DEATH_MOUNTAIN_CHECKS };
