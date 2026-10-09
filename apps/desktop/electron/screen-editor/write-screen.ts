/* @layer electron-main @kind logic */
import { serializeScreenRecord } from '@shared/game/data/record-codegen';
import type { ScreenRecord } from '@shared/game/data/types';
import type { WriteRecordResult, WriteScreenArgs } from '@shared/ipc/screen-editor-contract';
import { editSourceFile } from './edit-source-file';
import { withAllocatedIds } from './id-allocator';
import { startRecordFile } from './record-file-template';
import { resolveSourceFile } from './resolve-source-file';
import { insertBeforeArrayClose, replaceById } from './source-writers';
import { getWorkspaceRoot } from './workspace-root';

const writeScreen = (args: WriteScreenArgs): Promise<WriteRecordResult> => {
  const root = getWorkspaceRoot();
  const path = resolveSourceFile(root, args.filePath, 'data');
  const replaceId = args.replaceId;

  if (replaceId) {
    const record = { id: replaceId, ...args.record } as ScreenRecord;
    return editSourceFile(path, content => replaceById(content, replaceId, serializeScreenRecord(record)), [replaceId]);
  }
  return withAllocatedIds(root, 'screen', 1, async ([id]) => {
    const record = { id: id as ScreenRecord['id'], ...args.record } as ScreenRecord;
    const started = await startRecordFile(path, args.filePath, 'ScreenRecord');
    if (started) return { success: false, error: started };
    return editSourceFile(path, content => insertBeforeArrayClose(content, serializeScreenRecord(record)), [id]);
  });
};

export { writeScreen };
