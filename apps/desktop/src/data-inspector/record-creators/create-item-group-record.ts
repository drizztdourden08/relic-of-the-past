/* @layer renderer-app @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { registerItemGroupRecord } from '@rotp/game-data';
import type { ItemGroupRecord } from '@rotp/game-data';
import { draftOf } from '@app/views/DataInspector/behavior/draft-of';
import type { RecordCreator } from '@app/views/DataInspector/behavior/record-creators.type';
import { settleCreatedRecord } from '@app/views/DataInspector/behavior/settle-created-record';

const createItemGroupRecord: RecordCreator = async (draft) => {
  const record = draftOf<ItemGroupRecord>(draft);
  const result = await requireHostApi().screenEditor.allocateItemGroup({ label: record.label, memberIds: record.memberIds });
  if (!result.success) return { success: false, error: result.error };
  registerItemGroupRecord(result.record);
  return settleCreatedRecord('item-group', result.record.id);
};

export { createItemGroupRecord };
