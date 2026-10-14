/* @layer renderer-app @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { replaceItemGroupRecord } from '@rotp/game-data';
import type { ItemGroupRecord } from '@rotp/game-data';
import type { RecordWriter } from '@app/views/DataInspector/DataInspector.type';
import { recordOf } from '@app/views/DataInspector/behavior/record-of';
import { updateIdRefOption } from '@app/views/DataInspector/behavior/update-id-ref-option';
import { settleWrite } from './settle-write';

const writeItemGroupRecord: RecordWriter = async (row) => {
  const record = recordOf<ItemGroupRecord>(row);
  const { id, ...rest } = record;
  settleWrite(await requireHostApi().screenEditor.writeItemGroup({ groupId: id, record: rest }));
  replaceItemGroupRecord(record);
  updateIdRefOption('item-group', id);
};

export { writeItemGroupRecord };
