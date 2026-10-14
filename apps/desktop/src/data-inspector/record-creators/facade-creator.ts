/* @layer renderer-app @kind logic */
import { registerRecord } from '@rotp/game-data';
import type { EntityKind, Unnumbered } from '@rotp/game-data';
import type { AllocateRecordArgs, AllocateRecordResult } from '@app/ipc/screen-editor-contract';
import { draftOf } from '@app/views/DataInspector/behavior/draft-of';
import type { RecordCreator } from '@app/views/DataInspector/behavior/record-creators.type';
import { settleCreatedRecord } from '@app/views/DataInspector/behavior/settle-created-record';

const facadeCreator = <T extends { id: string }>(
  kind: EntityKind,
  send: (args: AllocateRecordArgs<T>) => Promise<AllocateRecordResult<T>>,
): RecordCreator => async (draft) => {
  const result = await send({ record: draftOf<Unnumbered<T>>(draft) });
  if (!result.success) return { success: false, error: result.error };
  registerRecord(kind, result.record);
  return settleCreatedRecord(kind, result.record.id);
};

export { facadeCreator };
