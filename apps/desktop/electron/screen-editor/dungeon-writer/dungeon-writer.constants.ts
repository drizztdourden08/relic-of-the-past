/* @layer electron-main @kind constants */
import { serializeDungeonRecord, dungeonRecordFile } from '@rotp/game-data';
import type { DungeonRecord } from '@rotp/game-data';
import type { RecordWriterSpec } from '../dataset-record-writer';

const DUNGEON_SPEC: RecordWriterSpec<DungeonRecord> = {
  kind: 'dungeon',
  recordType: 'DungeonRecord',
  target: record => dungeonRecordFile(record),
  serialize: serializeDungeonRecord,
};

export { DUNGEON_SPEC };
