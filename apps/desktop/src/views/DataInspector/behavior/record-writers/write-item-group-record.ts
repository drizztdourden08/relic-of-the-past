/* @layer renderer-app @kind logic */
import { appApi } from '@app/ipc/app-api';
import { replaceItemGroupRecord } from '@rotp/game-data';
import type { ItemGroupRecord, PendingItemGroupRecord } from '@rotp/game-data';
import type { RecordWriter } from '../../DataInspector.type';
import { updateIdRefOption } from '../update-id-ref-option';
import { settleWrite } from './settle-write';

const writeItemGroupRecord: RecordWriter = async (row) => {
  const record = row as unknown as ItemGroupRecord;
  const { id, ...rest } = record;
  settleWrite(await appApi().screenEditor.writeItemGroup({ groupId: id, record: rest as PendingItemGroupRecord }));
  replaceItemGroupRecord(record);
  updateIdRefOption('item-group', id);
};

export { writeItemGroupRecord };
