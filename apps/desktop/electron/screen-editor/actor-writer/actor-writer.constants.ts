/* @layer electron-main @kind constants */
import { serializeActorRecord } from '@rotp/game-data';
import { actorRecordFile } from '@rotp/game-data';
import type { ActorRecord } from '@rotp/game-data';
import type { RecordWriterSpec } from '../dataset-record-writer';

const ACTOR_SPEC: RecordWriterSpec<ActorRecord> = {
  kind: 'actor',
  recordType: 'ActorRecord',
  target: record => actorRecordFile(record),
  serialize: serializeActorRecord,
};

export { ACTOR_SPEC };
