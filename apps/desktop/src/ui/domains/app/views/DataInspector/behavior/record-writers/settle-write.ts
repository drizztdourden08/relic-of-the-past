/* @layer renderer-app @kind logic */
import { bumpDataRevision } from '@app/lib/game/data-revision';
import type { WriteRecordResult } from '@shared/ipc/screen-editor-contract';

const settleWrite = (result: WriteRecordResult): void => {
  if (!result.success) throw new Error(result.error);
  bumpDataRevision();
};

export { settleWrite };
