/* @layer shared-game @kind data */
/** Further split by locality out of checks/{dungeons,light-world,dark-world}.ts — Package T. */
import type { CheckRecord } from '../../types';
import { canRetrieveTablet } from '../../requirements/helpers';

const LW_DESERT_CHECKS: CheckRecord[] = [
  {
    id: 'check-029',
    gameId: { roomId: 266, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-160',
    randomizerName: 'Aginah\'s Cave',
    vanillaItemIds: ['item-024'],
  },
  {
    id: 'check-047',
    gameId: { roomId: 292, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-168',
    randomizerName: 'Checkerboard Cave',
    vanillaItemIds: ['item-024'],
  },
  {
    id: 'check-059',
    gameId: { owScreen: 48, mask: 64 },
    kind: 'standing',
    screenId: 'screen-009',
    randomizerName: 'Desert Ledge',
    vanillaItemIds: ['item-024'],
  },
  {
    id: 'check-080',
    gameId: { owScreen: 108, mask: 64 },
    kind: 'standing',
    screenId: 'screen-002',
    randomizerName: 'Bombos Tablet',
    vanillaItemIds: ['item-016'],
    requirements: canRetrieveTablet,
  },
];

export { LW_DESERT_CHECKS };
