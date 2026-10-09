/* @layer renderer-app @kind logic */
import { registerRecord } from '@shared/game/data';
import type { AreaRecord } from '@shared/game/data';
import type { RecordCreator } from '../record-creators.type';
import { settleCreatedRecord } from '../settle-created-record';

const createArea: RecordCreator = async (draft) => {
  const record = draft as unknown as AreaRecord;
  const result = await window.api.screenEditor.allocateGeography({
    kind: 'area', name: record.name, world: record.world,
  });
  if (!result.success) return { success: false, error: result.error };
  registerRecord('area', result.record);
  return settleCreatedRecord('area', result.record.id);
};

export { createArea };
