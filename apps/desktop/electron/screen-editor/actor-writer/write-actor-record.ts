/* @layer electron-main @kind logic */
import type { ActorRecord } from '@rotp/game-data';
import type { WriteRecordArgs, WriteRecordResult } from '@app/ipc/screen-editor-contract';
import { updateRecord } from '../dataset-record-writer';
import { ACTOR_SPEC } from './actor-writer.constants';

const writeActorRecord = (root: string, args: WriteRecordArgs<ActorRecord>): Promise<WriteRecordResult> =>
  updateRecord(root, ACTOR_SPEC, args.id, args.record);

export { writeActorRecord };
