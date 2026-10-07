/* @layer shared-game @kind data */

import type { DungeonRecord } from '@shared/game/data/types';

const LW_HYRULE_CASTLE_DUNGEON: DungeonRecord[] = [
  {
    id: 'dungeon-001',
    gameId: { palaceIndex: 0 },
    name: 'Hyrule Castle',
    fileStem: 'hyrule-castle',
    items: {
      bigKey: 'item-095',
      smallKey: 'item-096',
      smallKeyCount: 4,
      map: 'item-136',
      compass: null,
    },
    roomScreenIds: [
                     'screen-099',
                     'screen-100',
                     'screen-102',
                     'screen-103',
                     'screen-105',
                     'screen-107',
                     'screen-108',
                     'screen-112',
                     'screen-115',
                     'screen-116',
                     'screen-118',
                     'screen-119',
                     'screen-120',
                     'screen-122',
                     'screen-123',
                     'screen-124',
                     'screen-126',
                     'screen-127',
                     'screen-128',
                     'screen-133',
                     'screen-134',
                     'screen-135',
                   ],
    regionIds: ['region-169', 'region-172', 'region-170', 'region-171', 'region-174'],
  },
];

export { LW_HYRULE_CASTLE_DUNGEON };
