/* @layer shared-game @kind logic */
import { dungeonByGameId } from '../indexes';
import type { DungeonGameId, DungeonRecord } from '../types';

const getDungeonByGameId = (match: Partial<DungeonGameId>): DungeonRecord | undefined => dungeonByGameId(match);

export { getDungeonByGameId };
