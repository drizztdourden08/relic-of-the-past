/* @layer electron-main @kind logic */
import type { Unnumbered } from '@rotp/game-data';
import type { Allocated, AllocateRecordResult } from '@shared/ipc/screen-editor-contract';
import { startRecordFile } from '../record-file-template';
import { withAllocatedIds } from '../id-allocator';
import { resolveSourceFile } from '../resolve-source-file';
import { insertBeforeArrayClose } from '../source-writers';
import { NO_TARGET } from './dataset-record-writer.constants';
import type { RecordWriterSpec } from './dataset-record-writer.type';
import { editRecordFile } from './edit-record-file';

const createRecord = async <T extends { id: string }>(
  root: string,
  spec: RecordWriterSpec<T>,
  record: Unnumbered<T>,
): Promise<AllocateRecordResult<T>> => {
  const target = spec.target(record);
  if (!target.relativePath) return { success: false, error: target.unresolved ?? NO_TARGET };
  const path = resolveSourceFile(root, target.relativePath, 'data');
  const started = await startRecordFile(path, target.relativePath, spec.recordType);
  if (started) return { success: false, error: started };

  return withAllocatedIds(root, spec.kind, 1, async ([id]) => {
    const full = { id, ...record } as unknown as T;
    const error = await editRecordFile(path, content => insertBeforeArrayClose(content, spec.serialize(full)));
    if (error) return { success: false, error };
    return { success: true, record: full as Allocated<T> };
  });
};

export { createRecord };
