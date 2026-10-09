/* @layer electron-main @kind logic */
import type { ActorRecord } from '@rotp/game-data';
import type { AllocateRecordArgs, AllocateRecordResult } from '@app/ipc/screen-editor-contract';
import { createRecord } from '../dataset-record-writer';
import { ACTOR_SPEC } from './actor-writer.constants';

const allocateActor = (
  root: string,
  args: AllocateRecordArgs<ActorRecord>,
): Promise<AllocateRecordResult<ActorRecord>> => createRecord(root, ACTOR_SPEC, args.record);

export { allocateActor };
