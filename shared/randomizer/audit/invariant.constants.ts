/* @layer shared-game @kind constants */
import type { CheckKind } from '@rotp/game-data';

const SHAPE_RULE = 'A1-shape';
const UNIQUE_RULE = 'A2-unique';

const MAX_ROOM_ID = 0x13f;
const MAX_CHEST_INDEX = 5;

const BOSS_KILL_MASK = 2048;

const NO_DUNGEON_SCOPE = '(no-dungeon)';

const NEEDS_RECEIVE_ID: readonly CheckKind[] = ['chest', 'keyDrop', 'potItem', 'standing'];

export {
  BOSS_KILL_MASK, MAX_CHEST_INDEX, MAX_ROOM_ID, NEEDS_RECEIVE_ID, NO_DUNGEON_SCOPE, SHAPE_RULE, UNIQUE_RULE,
};
