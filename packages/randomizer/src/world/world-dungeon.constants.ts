/* @layer shared-game @kind constants */
import { all } from '@rotp/game-data';
import type { DungeonRecord } from '@rotp/game-data';

const DUNGEON_RECORD_BY_ID: ReadonlyMap<string, DungeonRecord> = new Map(all('dungeon').map((d) => [d.id, d]));

export { DUNGEON_RECORD_BY_ID };
