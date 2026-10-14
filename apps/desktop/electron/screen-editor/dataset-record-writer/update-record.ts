/* @layer electron-main @kind logic */
import type { Unnumbered } from '@rotp/game-data';
import type { WriteRecordResult } from '@app/ipc/screen-editor-contract';
import { replaceById } from '../source-writers';
import type { RecordWriterSpec } from './dataset-record-writer.type';
import { editRecordFile } from './edit-record-file';
import { homeOf } from './home-of';
import { numberRecord } from './number-record';

const updateRecord = async <T extends { id: string }>(
  root: string,
  spec: RecordWriterSpec<T>,
  id: string,
  record: Unnumbered<T>,
): Promise<WriteRecordResult> => {
  const home = await homeOf(root, spec.kind, id);
  if ('error' in home) return { success: false, error: home.error };
  const full = numberRecord<T>(id, record);
  const error = await editRecordFile(home.path, content => replaceById(content, id, spec.serialize(full)));
  return error ? { success: false, error } : { success: true, ids: [id] };
};

export { updateRecord };
