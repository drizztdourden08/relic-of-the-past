/* @layer renderer-app @kind logic */
import { appApi } from '@app/ipc/app-api';
import { registerRecord, screenRecordFile } from '@rotp/game-data';
import type { ScreenRecord, ScreenHome, PendingScreenRecord } from '@rotp/game-data';
import { NO_SOURCE_FILE } from '../../DataInspector.constants';
import type { RecordCreator } from '../record-creators.type';
import { settleCreatedRecord } from '../settle-created-record';
import { alreadyCoveredMessage } from './already-covered-message';
import { coveringScreen } from './covering-screen';

const createScreen: RecordCreator = async (draft) => {
  const covered = coveringScreen((draft as unknown as ScreenHome).gameId);
  if (covered) return { success: false, error: alreadyCoveredMessage(covered.id), needsReview: true };
  const target = screenRecordFile(draft as unknown as ScreenHome);
  if (!target.relativePath) return { success: false, error: target.unresolved ?? NO_SOURCE_FILE };
  const result = await appApi().screenEditor.writeScreen({
    filePath: target.relativePath,
    record: draft as unknown as PendingScreenRecord,
    replaceId: null,
  });
  if (!result.success) return { success: false, error: result.error };
  const [id] = result.ids;
  if (id === undefined) throw new Error('screen insert returned no id');
  registerRecord('screen', { id, ...draft } as unknown as ScreenRecord);
  return settleCreatedRecord('screen', id);
};

export { createScreen };
