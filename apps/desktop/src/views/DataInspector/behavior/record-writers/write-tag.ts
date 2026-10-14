/* @layer renderer-app @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { isTagKey, replaceTagRecord } from '@rotp/game-data';
import type { TagRecord, PendingTagRecord } from '@rotp/game-data';
import { TAG_NAME_MISMATCH } from '../../DataInspector.constants';
import type { RecordWriter } from '../../DataInspector.type';
import { invalidateTagSuggestions } from '../tag-suggestions';
import { updateIdRefOption } from '../update-id-ref-option';
import { settleWrite } from './settle-write';

const writeTag: RecordWriter = async (row) => {
  const record = row as unknown as TagRecord;
  const { id, ...rest } = record;
  const expectedName = `${record.namespace}:${record.value}`;
  if (!isTagKey(record.name) || record.name !== expectedName) throw new Error(TAG_NAME_MISMATCH);
  settleWrite(await requireHostApi().screenEditor.writeTag({ tagId: id, record: rest as PendingTagRecord }));
  replaceTagRecord(record);
  invalidateTagSuggestions();
  updateIdRefOption('tag', id);
};

export { writeTag };
