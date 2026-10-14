/* @layer renderer-app @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { isTagKey, replaceTagRecord } from '@rotp/game-data';
import type { TagRecord } from '@rotp/game-data';
import { TAG_NAME_MISMATCH } from '@app/views/DataInspector/DataInspector.constants';
import type { RecordWriter } from '@app/views/DataInspector/DataInspector.type';
import { recordOf } from '@app/views/DataInspector/behavior/record-of';
import { invalidateTagSuggestions } from '../tag-suggestions';
import { updateIdRefOption } from '@app/views/DataInspector/behavior/update-id-ref-option';
import { settleWrite } from './settle-write';

const writeTag: RecordWriter = async (row) => {
  const record = recordOf<TagRecord>(row);
  const { id, ...rest } = record;
  const expectedName = `${record.namespace}:${record.value}`;
  if (!isTagKey(record.name) || record.name !== expectedName) throw new Error(TAG_NAME_MISMATCH);
  settleWrite(await requireHostApi().screenEditor.writeTag({ tagId: id, record: rest }));
  replaceTagRecord(record);
  invalidateTagSuggestions();
  updateIdRefOption('tag', id);
};

export { writeTag };
