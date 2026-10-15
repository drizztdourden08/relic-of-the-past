/* @layer shared-game @kind constants */
import { EVENT_BIT } from '../records/checks/events/event-bits.constants';

const BOSS_KILLED_BIT: readonly number[] = EVENT_BIT.bossKilled;
const PRIZE_TAKEN_BIT: readonly number[] = EVENT_BIT.prizeTaken;
const SKULL_WOODS_ENTRANCE_BIT: readonly number[] = EVENT_BIT.skullWoodsEntrance;

export { BOSS_KILLED_BIT, PRIZE_TAKEN_BIT, SKULL_WOODS_ENTRANCE_BIT };
