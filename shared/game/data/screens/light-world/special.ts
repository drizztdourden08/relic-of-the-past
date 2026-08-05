/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ScreenRecord } from '../../types';

const LW_SPECIAL_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-038',
    gameId: {},
    kind: 'overworld',
    world: 'light',
    randomizerName: 'Menu / Save & Quit',
    areaId: 'area-000',
    locationId: 'location-000',
    position: { gridX: 0, gridY: 0 },
    tags: ['tag-014'],
  },
];

export { LW_SPECIAL_SCREENS };
