import type { ScreenConnection } from '../../../../types';

import { DW_PALACE_OF_DARKNESS_CONNECTIONS } from './palace-of-darkness';
import { DW_SWAMP_PALACE_CONNECTIONS } from './swamp-palace';
import { DW_SKULL_WOODS_CONNECTIONS } from './skull-woods';
import { DW_THIEVES_TOWN_CONNECTIONS } from './thieves-town';
import { DW_ICE_PALACE_CONNECTIONS } from './ice-palace';
import { DW_MISERY_MIRE_CONNECTIONS } from './misery-mire';
import { DW_TURTLE_ROCK_CONNECTIONS } from './turtle-rock';
import { DW_GANONS_TOWER_CONNECTIONS } from './ganons-tower';

export { DW_PALACE_OF_DARKNESS_CONNECTIONS } from './palace-of-darkness';
export { DW_SWAMP_PALACE_CONNECTIONS } from './swamp-palace';
export { DW_SKULL_WOODS_CONNECTIONS } from './skull-woods';
export { DW_THIEVES_TOWN_CONNECTIONS } from './thieves-town';
export { DW_ICE_PALACE_CONNECTIONS } from './ice-palace';
export { DW_MISERY_MIRE_CONNECTIONS } from './misery-mire';
export { DW_TURTLE_ROCK_CONNECTIONS } from './turtle-rock';
export { DW_GANONS_TOWER_CONNECTIONS } from './ganons-tower';

export const DW_DUNGEON_CONNECTIONS: ScreenConnection[] = [
  ...DW_PALACE_OF_DARKNESS_CONNECTIONS,
  ...DW_SWAMP_PALACE_CONNECTIONS,
  ...DW_SKULL_WOODS_CONNECTIONS,
  ...DW_THIEVES_TOWN_CONNECTIONS,
  ...DW_ICE_PALACE_CONNECTIONS,
  ...DW_MISERY_MIRE_CONNECTIONS,
  ...DW_TURTLE_ROCK_CONNECTIONS,
  ...DW_GANONS_TOWER_CONNECTIONS,
];
