/* @layer shared-game @kind data */
/** Further split by locality out of checks/{dungeons,light-world,dark-world}.ts — Package T. */
import type { CheckRecord } from '../../types';

const DW_DARK_NORTH_CHECKS: CheckRecord[] = [
  {
    id: 'check-076',
    gameId: { owScreen: 91, mask: 64 },
    kind: 'standing',
    screenId: 'screen-280',
    randomizerName: 'Pyramid',
    vanillaItemIds: ['item-024'],
  },
  {
    id: 'check-083',
    gameId: { owScreen: 99, mask: 64 },
    kind: 'standing',
    screenId: 'screen-281',
    randomizerName: 'Dark Blacksmith Ruins',
    vanillaItemIds: ['item-072'],
  },
];

export { DW_DARK_NORTH_CHECKS };
