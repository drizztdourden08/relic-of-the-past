/* @layer renderer-app @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { registerRecord } from '@rotp/game-data';
import type { AreaRecord } from '@rotp/game-data';
import { draftOf } from '@app/views/DataInspector/behavior/draft-of';
import type { RecordCreator } from '@app/views/DataInspector/behavior/record-creators.type';
import { settleCreatedRecord } from '@app/views/DataInspector/behavior/settle-created-record';

const createArea: RecordCreator = async (draft) => {
  const record = draftOf<AreaRecord>(draft);
  const result = await requireHostApi().screenEditor.allocateGeography({
    kind: 'area', name: record.name, world: record.world,
  });
  if (!result.success) return { success: false, error: result.error };
  registerRecord('area', result.record);
  return settleCreatedRecord('area', result.record.id);
};

export { createArea };
