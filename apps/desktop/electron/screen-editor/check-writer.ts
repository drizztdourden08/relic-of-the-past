/* @layer electron-main @kind logic */
/**
 * Creating, rewriting and removing a check record.
 *
 * This is the record-based path, and the only one that should grow: the older
 * `screenEditor:writeCheck` channel takes ready-made source TEXT and a
 * caller-chosen file, which predates the record facade. That one still has a
 * caller (the simulator's dataset-correction loop) and is left alone; nothing
 * new should reach for it, because a text payload cannot be checked against the
 * record shape the way `serializeCheckRecord` is.
 *
 * A check is filed with its dungeon when it names one, and otherwise with the
 * area of the screen it sits on — see record-file-targets.ts. Neither is
 * derived from a name, so renaming a check never moves it.
 */

// A check's destination is read off live dungeon and screen records, so the
// registry has to be seeded first. The dataset barrel seeds it on import, and
// this is the only reason it is imported here.
import '@shared/game/data';
import { serializeCheckRecord } from '@shared/game/data/record-codegen';
import { checkRecordFile } from '@shared/game/data/record-file-targets';
import type { CheckRecord } from '@shared/game/data/types';
import type {
  AllocateRecordArgs, AllocateRecordResult, DeleteRecordArgs, WriteRecordArgs, WriteRecordResult,
} from '@shared/ipc/screen-editor-contract';
import { createRecord, deleteRecord, updateRecord } from './dataset-record-writer';
import type { RecordWriterSpec } from './dataset-record-writer';

const SPEC: RecordWriterSpec<CheckRecord> = {
  kind: 'check',
  target: record => checkRecordFile(record),
  serialize: serializeCheckRecord,
};

const allocateCheck = (
  root: string,
  args: AllocateRecordArgs<CheckRecord>,
): Promise<AllocateRecordResult<CheckRecord>> => createRecord(root, SPEC, args.record);

const writeCheckRecord = (root: string, args: WriteRecordArgs<CheckRecord>): Promise<WriteRecordResult> =>
  updateRecord(root, SPEC, args.id, args.record);

const deleteCheck = (root: string, args: DeleteRecordArgs): Promise<WriteRecordResult> =>
  deleteRecord(root, SPEC, args.id);

export { allocateCheck, deleteCheck, writeCheckRecord };
