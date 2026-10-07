/* @layer shared-game @kind data */
/** The connections of the screens no area owns. */

import type { ConnectionRecord } from '@shared/game/data/types';

const LW_INTERIORS_SPECIAL_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-001',
    screenId: 'screen-038',
    toConnectionId: 'connection-1408',
    kind: 'teleport',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: ['tag-078'],
  },
  {
    id: 'connection-384',
    screenId: 'screen-038',
    toConnectionId: 'connection-1604',
    kind: 'teleport',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: ['tag-078'],
  },
];

export { LW_INTERIORS_SPECIAL_CONNECTIONS };
