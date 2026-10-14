/* @layer renderer-app @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { registerRecord } from '@rotp/game-data';
import type { LocationRecord } from '@rotp/game-data';
import type { RecordCreator } from '../record-creators.type';
import { settleCreatedRecord } from '../settle-created-record';

const createLocation: RecordCreator = async (draft) => {
  const record = draft as unknown as LocationRecord;
  const result = await requireHostApi().screenEditor.allocateGeography({
    kind: 'location', name: record.name, areaId: record.areaId,
  });
  if (!result.success) return { success: false, error: result.error };
  registerRecord('location', result.record);
  return settleCreatedRecord('location', result.record.id);
};

export { createLocation };
