/* @layer renderer-app @kind logic */
import { unregisterRecord } from '@shared/game/data';
import type { EntityKind } from '@shared/game/data';
import type { DeleteRecordArgs, WriteRecordResult } from '@shared/ipc/screen-editor-contract';
import type { DeleteResult } from '../DataInspector.type';
import { unregisterIdRefOption } from './unregister-id-ref-option';

const facadeDeleter = (
  kind: EntityKind,
  send: (args: DeleteRecordArgs) => Promise<WriteRecordResult>,
) => async (id: string): Promise<DeleteResult> => {
  const result = await send({ id });
  if (!result.success) return { success: false, error: result.error };
  unregisterRecord(kind, id);
  unregisterIdRefOption(kind, id);
  return { success: true };
};

export { facadeDeleter };
