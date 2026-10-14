/* @layer renderer-app @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { registerRecord, screenRecordFile } from '@rotp/game-data';
import type { ScreenHome, PendingScreenRecord } from '@rotp/game-data';
import { NO_SOURCE_FILE } from '@app/views/DataInspector/DataInspector.constants';
import { draftOf } from '@app/views/DataInspector/behavior/draft-of';
import type { RecordCreator } from '@app/views/DataInspector/behavior/record-creators.type';
import { settleCreatedRecord } from '@app/views/DataInspector/behavior/settle-created-record';
import { alreadyCoveredMessage } from './already-covered-message';
import { coveringScreen } from './covering-screen';

const createScreen: RecordCreator = async (draft) => {
  const pending = draftOf<PendingScreenRecord & ScreenHome>(draft);
  const covered = coveringScreen(pending.gameId);
  if (covered) return { success: false, error: alreadyCoveredMessage(covered.id), needsReview: true };
  const target = screenRecordFile(pending);
  if (!target.relativePath) return { success: false, error: target.unresolved ?? NO_SOURCE_FILE };
  const result = await requireHostApi().screenEditor.writeScreen({
    filePath: target.relativePath,
    record: pending,
    replaceId: null,
  });
  if (!result.success) return { success: false, error: result.error };
  const [id] = result.ids;
  if (id === undefined) throw new Error('screen insert returned no id');
  registerRecord('screen', { id, ...pending });
  return settleCreatedRecord('screen', id);
};

export { createScreen };
