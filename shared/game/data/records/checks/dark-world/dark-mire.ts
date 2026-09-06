/* @layer shared-game @kind data */
/** Package T split checks/{dungeons,light-world,dark-world}.ts further by locality. */
import type { CheckRecord } from '@shared/game/data/types';

const DW_DARK_MIRE_CHECKS: CheckRecord[] = [
  {
    id: 'check-089',
    gameId: { roomId: 269, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-472',
    randomizerName: 'Mire Shed - Left',
    vanillaItemIds: ['item-024'],
  },
  {
    id: 'check-090',
    gameId: { roomId: 269, chestIndex: 1 },
    kind: 'chest',
    screenId: 'screen-472',
    randomizerName: 'Mire Shed - Right',
    vanillaItemIds: ['item-072'],
  },
];

export { DW_DARK_MIRE_CHECKS };
