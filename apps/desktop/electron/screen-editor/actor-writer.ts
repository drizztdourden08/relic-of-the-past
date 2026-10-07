/* @layer electron-main @kind logic */
/**
 * Creating, rewriting and removing an actor record. A new record is filed by
 * KIND into the last file of its size-split group; an existing one is edited
 * where it sits, found by id.
 */

import { serializeActorRecord } from '@shared/game/data/record-codegen';
import { actorRecordFile } from '@shared/game/data/record-file-targets';
import type { ActorRecord } from '@shared/game/data/types';
import type {
  AllocateRecordArgs, AllocateRecordResult, DeleteRecordArgs, WriteRecordArgs, WriteRecordResult,
} from '@shared/ipc/screen-editor-contract';
import { createRecord, deleteRecord, updateRecord } from './dataset-record-writer';
import type { RecordWriterSpec } from './dataset-record-writer';

const SPEC: RecordWriterSpec<ActorRecord> = {
  kind: 'actor',
  target: record => actorRecordFile(record),
  serialize: serializeActorRecord,
};

const allocateActor = (
  root: string,
  args: AllocateRecordArgs<ActorRecord>,
): Promise<AllocateRecordResult<ActorRecord>> => createRecord(root, SPEC, args.record);

const writeActorRecord = (root: string, args: WriteRecordArgs<ActorRecord>): Promise<WriteRecordResult> =>
  updateRecord(root, SPEC, args.id, args.record);

const deleteActor = (root: string, args: DeleteRecordArgs): Promise<WriteRecordResult> =>
  deleteRecord(root, SPEC, args.id);

export { allocateActor, deleteActor, writeActorRecord };
