/* @layer shared-game @kind data */
/** The screens no area owns. */

import type { ScreenRecord } from '@shared/game/data/types';

const LW_INTERIORS_SPECIAL_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-038',
    gameId: {},
    kind: 'overworld',
    world: 'light',
    name: 'Menu / Save & Quit',
    areaId: 'area-000',
    locationId: 'location-000',
    position: { gridX: 0, gridY: 0 },
    tags: ['tag-014'],
  },
];

export { LW_INTERIORS_SPECIAL_SCREENS };
