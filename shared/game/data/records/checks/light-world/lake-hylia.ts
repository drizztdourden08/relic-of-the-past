/* @layer shared-game @kind data */
/** Package T split checks/{dungeons,light-world,dark-world}.ts further by locality. */
import type { CheckRecord } from '@shared/game/data/types';

const LW_LAKE_HYLIA_CHECKS: CheckRecord[] = [
  {
    id: 'check-053',
    gameId: { roomId: 288, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-174',
    randomizerName: 'Ice Rod Cave',
    vanillaItemIds: ['item-009'],
  },
  {
    id: 'check-057',
    gameId: { owScreen: 53, mask: 64 },
    kind: 'standing',
    screenId: 'screen-025',
    randomizerName: 'Lake Hylia Island',
    vanillaItemIds: ['item-024'],
  },
];

export { LW_LAKE_HYLIA_CHECKS };
