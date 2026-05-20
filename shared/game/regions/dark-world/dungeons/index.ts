import type { RegionDefinition } from '../../types';

import { PALACE_OF_DARKNESS_DUNGEON } from './palace-of-darkness';
import { SWAMP_PALACE_DUNGEON } from './swamp-palace';
import { THIEVES_TOWN_DUNGEON } from './thieves-town';
import { SKULL_WOODS_DUNGEON } from './skull-woods';
import { ICE_PALACE_DUNGEON } from './ice-palace';
import { MISERY_MIRE_DUNGEON } from './misery-mire';
import { TURTLE_ROCK_DUNGEON } from './turtle-rock';
import { GANONS_TOWER_DUNGEON } from './ganons-tower';
import { GANON_DUNGEON } from './ganons-pyramid';

export { PALACE_OF_DARKNESS_DUNGEON } from './palace-of-darkness';
export { SWAMP_PALACE_DUNGEON } from './swamp-palace';
export { THIEVES_TOWN_DUNGEON } from './thieves-town';
export { SKULL_WOODS_DUNGEON } from './skull-woods';
export { ICE_PALACE_DUNGEON } from './ice-palace';
export { MISERY_MIRE_DUNGEON } from './misery-mire';
export { TURTLE_ROCK_DUNGEON } from './turtle-rock';
export { GANONS_TOWER_DUNGEON } from './ganons-tower';
export { GANON_DUNGEON } from './ganons-pyramid';

export const DW_DUNGEON_REGIONS: RegionDefinition[] = [
  ...PALACE_OF_DARKNESS_DUNGEON,
  ...SWAMP_PALACE_DUNGEON,
  ...THIEVES_TOWN_DUNGEON,
  ...SKULL_WOODS_DUNGEON,
  ...ICE_PALACE_DUNGEON,
  ...MISERY_MIRE_DUNGEON,
  ...TURTLE_ROCK_DUNGEON,
  ...GANONS_TOWER_DUNGEON,
  ...GANON_DUNGEON,
];
