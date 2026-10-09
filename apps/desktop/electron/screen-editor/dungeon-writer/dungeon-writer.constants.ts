/* @layer electron-main @kind constants */
import { serializeDungeonRecord } from '@shared/game/data/record-codegen';
import { dungeonRecordFile } from '@shared/game/data/record-file-targets';
import type { DungeonRecord } from '@shared/game/data/types';
import type { RecordWriterSpec } from '../dataset-record-writer';

const DUNGEON_SPEC: RecordWriterSpec<DungeonRecord> = {
  kind: 'dungeon',
  recordType: 'DungeonRecord',
  target: record => dungeonRecordFile(record),
  serialize: serializeDungeonRecord,
};

export { DUNGEON_SPEC };
