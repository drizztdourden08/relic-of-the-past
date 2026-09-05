/* @layer electron-main @kind logic */
/**
 * Creating, rewriting and removing an item record.
 *
 * A new record is filed by CATEGORY, one canonical file each. That is a
 * deliberate simplification of a committed split with no category rule to
 * recover, and record-file-targets.ts documents it as such. Existing records are never
 * moved: an edit or a removal finds the record where it already sits, by id.
 */

import { serializeItemRecord } from '@shared/game/data/record-codegen';
import { itemRecordFile } from '@shared/game/data/record-file-targets';
import type { ItemRecord } from '@shared/game/data/types';
import type {
  AllocateRecordArgs, AllocateRecordResult, DeleteRecordArgs, WriteRecordArgs, WriteRecordResult,
} from '@shared/ipc/screen-editor-contract';
import { createRecord, deleteRecord, updateRecord } from './dataset-record-writer';
import type { RecordWriterSpec } from './dataset-record-writer';

const SPEC: RecordWriterSpec<ItemRecord> = {
  kind: 'item',
  target: record => itemRecordFile(record),
  serialize: serializeItemRecord,
};

const allocateItem = (
  root: string,
  args: AllocateRecordArgs<ItemRecord>,
): Promise<AllocateRecordResult<ItemRecord>> => createRecord(root, SPEC, args.record);

const writeItemRecord = (root: string, args: WriteRecordArgs<ItemRecord>): Promise<WriteRecordResult> =>
  updateRecord(root, SPEC, args.id, args.record);

const deleteItem = (root: string, args: DeleteRecordArgs): Promise<WriteRecordResult> =>
  deleteRecord(root, SPEC, args.id);

export { allocateItem, deleteItem, writeItemRecord };
