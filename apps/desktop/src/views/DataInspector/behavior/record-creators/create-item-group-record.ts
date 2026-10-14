/* @layer renderer-app @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { registerItemGroupRecord } from '@rotp/game-data';
import type { ItemGroupRecord } from '@rotp/game-data';
import type { RecordCreator } from '../record-creators.type';
import { settleCreatedRecord } from '../settle-created-record';

const createItemGroupRecord: RecordCreator = async (draft) => {
  const record = draft as unknown as ItemGroupRecord;
  const result = await requireHostApi().screenEditor.allocateItemGroup({ label: record.label, memberIds: record.memberIds });
  if (!result.success) return { success: false, error: result.error };
  registerItemGroupRecord(result.record);
  return settleCreatedRecord('item-group', result.record.id);
};

export { createItemGroupRecord };
