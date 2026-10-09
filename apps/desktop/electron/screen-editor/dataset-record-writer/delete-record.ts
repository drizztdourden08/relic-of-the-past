/* @layer electron-main @kind logic */
import type { WriteRecordResult } from '@app/ipc/screen-editor-contract';
import { removeById } from '../source-writers';
import type { RecordWriterSpec } from './dataset-record-writer.type';
import { editRecordFile } from './edit-record-file';
import { homeOf } from './home-of';

const deleteRecord = async <T extends { id: string }>(
  root: string,
  spec: RecordWriterSpec<T>,
  id: string,
): Promise<WriteRecordResult> => {
  const home = await homeOf(root, spec.kind, id);
  if ('error' in home) return { success: false, error: home.error };
  const error = await editRecordFile(home.path, content => removeById(content, id));
  return error ? { success: false, error } : { success: true, ids: [id] };
};

export { deleteRecord };
