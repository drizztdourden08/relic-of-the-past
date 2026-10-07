/* @layer shared-game @kind barrel */
import type { CheckRecord } from '@shared/game/data/types';
import { DUNGEON_CASTLE_TOWER_CHECKS } from './castle-tower';
import { DUNGEON_DESERT_PALACE_CHECKS } from './desert-palace';
import { DUNGEON_EASTERN_PALACE_CHECKS } from './eastern-palace';
import { DUNGEON_GANONS_TOWER_CHECKS } from './ganons-tower';
import { DUNGEON_HYRULE_CASTLE_CHECKS } from './hyrule-castle';
import { DUNGEON_ICE_PALACE_CHECKS } from './ice-palace';
import { DUNGEON_MISERY_MIRE_CHECKS } from './misery-mire';
import { DUNGEON_PALACE_OF_DARKNESS_CHECKS } from './palace-of-darkness';
import { DUNGEON_SKULL_WOODS_CHECKS } from './skull-woods';
import { DUNGEON_SWAMP_PALACE_CHECKS } from './swamp-palace';
import { DUNGEON_THIEVES_TOWN_CHECKS } from './thieves-town';
import { DUNGEON_TOWER_OF_HERA_CHECKS } from './tower-of-hera';
import { DUNGEON_TURTLE_ROCK_CHECKS } from './turtle-rock';

const DUNGEON_CHECKS: CheckRecord[] = [
  ...DUNGEON_CASTLE_TOWER_CHECKS,
  ...DUNGEON_DESERT_PALACE_CHECKS,
  ...DUNGEON_EASTERN_PALACE_CHECKS,
  ...DUNGEON_GANONS_TOWER_CHECKS,
  ...DUNGEON_HYRULE_CASTLE_CHECKS,
  ...DUNGEON_ICE_PALACE_CHECKS,
  ...DUNGEON_MISERY_MIRE_CHECKS,
  ...DUNGEON_PALACE_OF_DARKNESS_CHECKS,
  ...DUNGEON_SKULL_WOODS_CHECKS,
  ...DUNGEON_SWAMP_PALACE_CHECKS,
  ...DUNGEON_THIEVES_TOWN_CHECKS,
  ...DUNGEON_TOWER_OF_HERA_CHECKS,
  ...DUNGEON_TURTLE_ROCK_CHECKS,
];

export { DUNGEON_CHECKS };
