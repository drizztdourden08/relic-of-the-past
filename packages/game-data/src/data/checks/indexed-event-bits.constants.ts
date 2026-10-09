/* @layer shared-game @kind constants */
import { EVENT_BIT } from '../records/checks/events/event-bits.constants';

const PALACE_COUNT = 14;
const SKULL_WOODS_FRONT_ENTRANCE_COUNT = 5;

const BOSS_KILLED_BIT: readonly number[] = EVENT_BIT.bossKilled;
const PRIZE_TAKEN_BIT: readonly number[] = EVENT_BIT.prizeTaken;
const SKULL_WOODS_ENTRANCE_BIT: readonly number[] = EVENT_BIT.skullWoodsEntrance;

export { BOSS_KILLED_BIT, PALACE_COUNT, PRIZE_TAKEN_BIT, SKULL_WOODS_ENTRANCE_BIT, SKULL_WOODS_FRONT_ENTRANCE_COUNT };
