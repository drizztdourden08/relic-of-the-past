/* @layer renderer-app @kind logic */
import { registerRecord } from '@rotp/game-data';
import type { EntityKind } from '@rotp/game-data';
import type { Unnumbered } from '@rotp/game-data';
import type { AllocateRecordArgs, AllocateRecordResult } from '@shared/ipc/screen-editor-contract';
import type { RecordCreator } from '../record-creators.type';
import { settleCreatedRecord } from '../settle-created-record';

const facadeCreator = <T extends { id: string }>(
  kind: EntityKind,
  send: (args: AllocateRecordArgs<T>) => Promise<AllocateRecordResult<T>>,
): RecordCreator => async (draft) => {
  const result = await send({ record: draft as unknown as Unnumbered<T> });
  if (!result.success) return { success: false, error: result.error };
  registerRecord(kind, result.record);
  return settleCreatedRecord(kind, result.record.id);
};

export { facadeCreator };
