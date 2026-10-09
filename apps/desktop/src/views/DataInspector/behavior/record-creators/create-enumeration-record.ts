/* @layer renderer-app @kind logic */
import { appApi } from '@app/ipc/app-api';
import { registerEnumerationRecord } from '@rotp/game-data';
import type { EnumerationEntry } from '@rotp/game-data';
import type { RecordCreator } from '../record-creators.type';
import { settleCreatedRecord } from '../settle-created-record';

const createEnumerationRecord: RecordCreator = async (draft) => {
  const record = draft as unknown as EnumerationEntry;
  const result = await appApi().screenEditor.allocateEnumeration({
    category: record.category, value: record.value, label: record.label, appliesTo: record.appliesTo,
  });
  if (!result.success) return { success: false, error: result.error };
  registerEnumerationRecord(result.record);
  return settleCreatedRecord('enumeration', result.record.id);
};

export { createEnumerationRecord };
