/* @layer shared-game @kind data */
/** Package T split checks/{dungeons,light-world,dark-world}.ts further by locality, then by size into ganons-tower-1.ts / ganons-tower-2.ts. */
import type { CheckRecord } from '@shared/game/data/types';
import { DUNGEON_GANONS_TOWER_CHECKS_1 } from './ganons-tower-1';
import { DUNGEON_GANONS_TOWER_CHECKS_2 } from './ganons-tower-2';

const DUNGEON_GANONS_TOWER_CHECKS: CheckRecord[] = [...DUNGEON_GANONS_TOWER_CHECKS_1, ...DUNGEON_GANONS_TOWER_CHECKS_2];

export { DUNGEON_GANONS_TOWER_CHECKS };
