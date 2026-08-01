/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ScreenRecord } from '../../types';

const LW_WELLS_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-221',
    gameId: { roomIndex: 47 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'well',
    randomizerName: 'Kakariko Well (top)',
    areaId: 'area-012',
    locationId: 'location-017',
    tags: ['env:underground', 'traverse:fall'],
    status: 'mapped',
  },
  {
    id: 'screen-224',
    gameId: { roomIndex: 47 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'well',
    randomizerName: 'Kakariko Well (bottom)',
    areaId: 'area-012',
    locationId: 'location-017',
    tags: ['env:underground', 'loot:chest'],
    status: 'mapped',
  },
];

export { LW_WELLS_SCREENS };
