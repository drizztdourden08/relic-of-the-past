import type { RegionDefinition } from '../../types';

export const DW_SHOPS: RegionDefinition[] = [
  { id: 'village-of-outcasts-shop', name: 'Village of Outcasts Shop', type: 'cave', indoor: true, displayName: 'Village of Outcasts', inGameIndex: 0x011c, subtitle: 'Shop', tags: ['world:dark', 'env:inside', 'type:shop', 'area:village_of_outcasts'] },
  { id: 'dark-lake-hylia-shop', name: 'Dark Lake Hylia Shop', type: 'cave', indoor: true, displayName: 'Dark Lake', inGameIndex: 0x011e, subtitle: 'Shop', tags: ['world:dark', 'env:inside', 'type:shop', 'area:dark_lake_hylia'] },
  { id: 'dark-world-lumberjack-shop', name: 'Dark World Lumberjack Shop', type: 'cave', indoor: true, displayName: 'Skull Woods', inGameIndex: 0x0115, subtitle: 'Shop', tags: ['world:dark', 'env:inside', 'type:shop', 'area:skull_woods_area'] },
  { id: 'dark-world-potion-shop', name: 'Dark World Potion Shop', type: 'cave', indoor: true, displayName: 'Village of Outcasts', inGameIndex: 0x0118, subtitle: 'Potion Shop', tags: ['world:dark', 'env:inside', 'type:shop', 'area:village_of_outcasts'] },
  { id: 'red-shield-shop', name: 'Red Shield Shop', type: 'cave', indoor: true, displayName: 'Village of Outcasts', inGameIndex: 0x0115, subtitle: 'Red Shield Shop', tags: ['world:dark', 'env:inside', 'type:shop', 'area:village_of_outcasts'] },
  { id: 'big-bomb-shop', name: 'Big Bomb Shop', type: 'cave', indoor: true, displayName: 'Dark South', inGameIndex: 0x010d, subtitle: 'Big Bomb Shop', tags: ['world:dark', 'env:inside', 'type:shop', 'area:dark_south'] },
  { id: 'cave-shop-dark-death-mountain', name: 'Cave Shop (Dark Death Mountain)', type: 'cave', indoor: true, displayName: 'Dark Death Mountain', inGameIndex: 0x00df, subtitle: 'Cave Shop', tags: ['world:dark', 'env:underground', 'type:shop', 'area:dark_death_mountain'] },
];
