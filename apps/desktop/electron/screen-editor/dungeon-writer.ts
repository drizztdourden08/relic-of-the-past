/* @layer electron-main @kind logic */
/**
 * Creating, rewriting and removing a dungeon record.
 *
 * The two dungeon files were split by size alone, so a new record always goes
 * to the second. Nothing on a dungeon says which half it belongs to, and
 * inventing a balancing rule for a collection of thirteen would be more
 * machinery than the problem. An existing record is found by id across both.
 */

import { serializeDungeonRecord } from '@shared/game/data/record-codegen';
import { dungeonRecordFile } from '@shared/game/data/record-file-targets';
import type { DungeonRecord } from '@shared/game/data/types';
import type {
  AllocateRecordArgs, AllocateRecordResult, DeleteRecordArgs, WriteRecordArgs, WriteRecordResult,
} from '@shared/ipc/screen-editor-contract';
import { createRecord, deleteRecord, updateRecord } from './dataset-record-writer';
import type { RecordWriterSpec } from './dataset-record-writer';

const SPEC: RecordWriterSpec<DungeonRecord> = {
  kind: 'dungeon',
  target: () => dungeonRecordFile(),
  serialize: serializeDungeonRecord,
};

const allocateDungeon = (
  root: string,
  args: AllocateRecordArgs<DungeonRecord>,
): Promise<AllocateRecordResult<DungeonRecord>> => createRecord(root, SPEC, args.record);

const writeDungeonRecord = (root: string, args: WriteRecordArgs<DungeonRecord>): Promise<WriteRecordResult> =>
  updateRecord(root, SPEC, args.id, args.record);

const deleteDungeon = (root: string, args: DeleteRecordArgs): Promise<WriteRecordResult> =>
  deleteRecord(root, SPEC, args.id);

export { allocateDungeon, deleteDungeon, writeDungeonRecord };
