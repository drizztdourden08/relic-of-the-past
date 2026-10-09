/* @layer shared-game @kind constants */
import type { GridPos } from '@rotp/game-core';

const ROOM_CLEAR_KILL_ITEM = 0xff;

const SCREEN_CENTER: GridPos = { row: 32, col: 32 };

const TRAP_ENTRY_RADIUS = 8;

export { ROOM_CLEAR_KILL_ITEM, SCREEN_CENTER, TRAP_ENTRY_RADIUS };
