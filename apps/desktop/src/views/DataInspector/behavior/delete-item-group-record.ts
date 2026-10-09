/* @layer renderer-app @kind logic */
import { appApi } from '@app/ipc/app-api';
import { unregisterItemGroupRecord } from '@rotp/game-data';
import type { ItemGroupId } from '@rotp/game-data';
import type { DeleteResult } from '../DataInspector.type';
import { unregisterIdRefOption } from './unregister-id-ref-option';

const deleteItemGroupRecord = async (id: string): Promise<DeleteResult> => {
  const result = await appApi().screenEditor.deleteItemGroup({ groupId: id as ItemGroupId });
  if (!result.success) return { success: false, error: result.error };
  unregisterItemGroupRecord(id);
  unregisterIdRefOption('item-group', id);
  return { success: true };
};

export { deleteItemGroupRecord };
