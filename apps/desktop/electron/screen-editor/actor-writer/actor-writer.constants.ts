/* @layer electron-main @kind constants */
import { serializeActorRecord } from '@shared/game/data/record-codegen';
import { actorRecordFile } from '@shared/game/data/record-file-targets';
import type { ActorRecord } from '@shared/game/data/types';
import type { RecordWriterSpec } from '../dataset-record-writer';

const ACTOR_SPEC: RecordWriterSpec<ActorRecord> = {
  kind: 'actor',
  recordType: 'ActorRecord',
  target: record => actorRecordFile(record),
  serialize: serializeActorRecord,
};

export { ACTOR_SPEC };
