/* @layer renderer-app @kind logic */
import { appApi } from '@app/ipc/app-api';
import { registerItemGroupRecord } from '@shared/game/data';
import type { ItemGroupRecord } from '@shared/game/data';
import type { RecordCreator } from '../record-creators.type';
import { settleCreatedRecord } from '../settle-created-record';

const createItemGroupRecord: RecordCreator = async (draft) => {
  const record = draft as unknown as ItemGroupRecord;
  const result = await appApi().screenEditor.allocateItemGroup({ label: record.label, memberIds: record.memberIds });
  if (!result.success) return { success: false, error: result.error };
  registerItemGroupRecord(result.record);
  return settleCreatedRecord('item-group', result.record.id);
};

export { createItemGroupRecord };
