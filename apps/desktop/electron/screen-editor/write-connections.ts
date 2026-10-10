/* @layer electron-main @kind logic */
import { serializeConnectionRecord } from '@rotp/game-data';
import type { ConnectionRecord } from '@rotp/game-data';
import type { WriteConnectionsArgs, WriteRecordResult } from '@app/ipc/screen-editor-contract';
import { editSourceFile } from './edit-source-file';
import { withAllocatedIds } from './id-allocator';
import { startRecordFile } from './record-file-template';
import { resolveSourceFile } from './resolve-source-file';
import { insertBeforeArrayClose, removeById, replaceById } from './source-writers';
import { getWorkspaceRoot } from './workspace-root';

const allocatedId = (ids: readonly string[], index: number): string => {
  const id = ids[index];
  if (id === undefined) throw new Error('the id allocator returned fewer connection ids than records');
  return id;
};

const writeConnections = (args: WriteConnectionsArgs): Promise<WriteRecordResult> => {
  const root = getWorkspaceRoot();
  const path = resolveSourceFile(root, args.filePath, 'data');

  if (args.mode === 'remove') {
    return editSourceFile(path, content => removeById(content, args.connectionId), [args.connectionId]);
  }
  if (args.mode === 'replace') {
    const record = { id: args.connectionId, ...args.record };
    return editSourceFile(path, content => replaceById(content, args.connectionId, serializeConnectionRecord(record)), [args.connectionId]);
  }
  const records = args.records;
  if (records.length === 0) return Promise.resolve({ success: false, error: 'insert needs at least one record' });
  return withAllocatedIds(root, 'connection', records.length, async (ids) => {
    const code = records
      .map((record, i) => serializeConnectionRecord({ id: allocatedId(ids, i) as ConnectionRecord['id'], ...record }))
      .join('\n');
    const started = await startRecordFile(path, args.filePath, 'ConnectionRecord');
    if (started) return { success: false, error: started };
    return editSourceFile(path, content => insertBeforeArrayClose(content, code), ids);
  });
};

export { writeConnections };
