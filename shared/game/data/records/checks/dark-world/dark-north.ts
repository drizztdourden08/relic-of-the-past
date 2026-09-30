/* @layer shared-game @kind data */
/** Package T split checks/{dungeons,light-world,dark-world}.ts by locality. */
import type { CheckRecord } from '@shared/game/data/types';

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
