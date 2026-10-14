/* @layer renderer-app @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { replaceEnumerationRecord } from '@rotp/game-data';
import type { EnumerationEntry } from '@rotp/game-data';
import type { RecordWriter } from '@app/views/DataInspector/DataInspector.type';
import { recordOf } from '@app/views/DataInspector/behavior/record-of';
import { updateIdRefOption } from '@app/views/DataInspector/behavior/update-id-ref-option';
import { settleWrite } from './settle-write';

const writeEnumerationRecord: RecordWriter = async (row) => {
  const record = recordOf<EnumerationEntry>(row);
  const { id, ...rest } = record;
  settleWrite(await requireHostApi().screenEditor.writeEnumeration({ enumerationId: id, record: rest }));
  replaceEnumerationRecord(record);
  updateIdRefOption('enumeration', id);
};

export { writeEnumerationRecord };
