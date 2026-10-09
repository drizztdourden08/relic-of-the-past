/* @layer shared-game @kind types */
import type { DungeonId } from '@rotp/game-data';
import type { ANY_DUNGEON } from './dungeon-key-target.constants';

type KeyTarget = DungeonId | typeof ANY_DUNGEON;

export type { KeyTarget };
