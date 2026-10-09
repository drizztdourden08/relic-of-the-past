/* @layer renderer-app @kind logic */
import { appApi } from '@app/ipc/app-api';
import { replaceEnumerationRecord } from '@shared/game/data';
import type { EnumerationEntry } from '@shared/game/data';
import type { PendingEnumerationRecord } from '@shared/game/data/record-codegen';
import type { RecordWriter } from '../../DataInspector.type';
import { updateIdRefOption } from '../update-id-ref-option';
import { settleWrite } from './settle-write';

const writeEnumerationRecord: RecordWriter = async (row) => {
  const record = row as unknown as EnumerationEntry;
  const { id, ...rest } = record;
  settleWrite(await appApi().screenEditor.writeEnumeration({ enumerationId: id, record: rest as PendingEnumerationRecord }));
  replaceEnumerationRecord(record);
  updateIdRefOption('enumeration', id);
};

export { writeEnumerationRecord };
