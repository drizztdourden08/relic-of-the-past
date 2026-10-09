/* @layer shared-game @kind constants */
import { all } from '@shared/game/data';
import type { DungeonRecord } from '@shared/game/data/types';

const DUNGEON_RECORD_BY_ID: ReadonlyMap<string, DungeonRecord> = new Map(all('dungeon').map((d) => [d.id, d]));

export { DUNGEON_RECORD_BY_ID };
