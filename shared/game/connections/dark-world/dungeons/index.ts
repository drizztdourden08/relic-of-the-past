import type { RegionConnection } from '../../../types';
import { DW_GANONS_PYRAMID_CONNECTIONS } from './ganons-pyramid';
import { DW_GANONS_TOWER_CONNECTIONS } from './ganons-tower';
import { DW_ICE_PALACE_CONNECTIONS } from './ice-palace';
import { DW_MISERY_MIRE_CONNECTIONS } from './misery-mire';
import { DW_PALACE_OF_DARKNESS_CONNECTIONS } from './palace-of-darkness';
import { DW_SKULL_WOODS_CONNECTIONS } from './skull-woods';
import { DW_SWAMP_PALACE_CONNECTIONS } from './swamp-palace';
import { DW_THIEVES_TOWN_CONNECTIONS } from './thieves-town';
import { DW_TURTLE_ROCK_CONNECTIONS } from './turtle-rock';

export const DW_DUNGEON_CONNECTIONS: RegionConnection[] = [
  ...DW_GANONS_PYRAMID_CONNECTIONS,
  ...DW_GANONS_TOWER_CONNECTIONS,
  ...DW_ICE_PALACE_CONNECTIONS,
  ...DW_MISERY_MIRE_CONNECTIONS,
  ...DW_PALACE_OF_DARKNESS_CONNECTIONS,
  ...DW_SKULL_WOODS_CONNECTIONS,
  ...DW_SWAMP_PALACE_CONNECTIONS,
  ...DW_THIEVES_TOWN_CONNECTIONS,
  ...DW_TURTLE_ROCK_CONNECTIONS,
];
