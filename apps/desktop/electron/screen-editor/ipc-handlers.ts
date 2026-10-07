/* @layer electron-main @kind logic */
/**
 * IPC handlers for the dev screen/connection editor.
 *
 * The renderer sends RECORDS, never source text and never an id for something
 * new: this process allocates every id and runs the dataset's own emitter, so a
 * write cannot carry a caller-minted id or a shape the record interfaces no
 * longer describe.
 */

import { readFile, writeFile } from 'fs/promises';
import { handle } from '../lib/ipc/handle';
import { serializeConnectionRecord, serializeScreenRecord } from '@shared/game/data/record-codegen';
import type { ConnectionRecord, ScreenRecord } from '@shared/game/data/types';
import type {
  WriteConnectionsArgs, WriteRecordResult, WriteScreenArgs,
} from '@shared/ipc/screen-editor-contract';
import { resolveSourceFile } from './resolve-source-file';
import { insertBeforeArrayClose, removeById, replaceById } from './source-writers';
import type { WriteResult } from './source-writers';
import { withAllocatedIds } from './id-allocator';
import { registerConnectionPairHandler } from './connection-pair-writer';
import { allocateGeography } from './geography-writer';
import { allocateTag, deleteTag, writeTag } from './tag-writer';
import { allocateItemGroup, deleteItemGroup, writeItemGroup } from './item-group-writer';
import { allocateEnumeration, deleteEnumeration, writeEnumeration } from './enumeration-writer';
import { registerRecordHandlers } from './record-handlers';
import { getWorkspaceRoot } from './workspace-root';

const failed = (e: unknown): { success: false; error: string } =>
  ({ success: false, error: e instanceof Error ? e.message : 'Unknown error' });

// Read → transform → write in one place, so every handler treats a writer error
// the same way and nothing half-writes.
const editFile = async (
  path: string,
  edit: (content: string) => WriteResult,
  ids: readonly string[],
): Promise<WriteRecordResult> => {
  const content = await readFile(path, 'utf-8');
  const result = edit(content);
  if (result.error) return { success: false, error: result.error };
  await writeFile(path, result.content, 'utf-8');
  return { success: true, ids };
};

const writeScreen = (args: WriteScreenArgs): Promise<WriteRecordResult> => {
  const root = getWorkspaceRoot();
  const path = resolveSourceFile(root, args.filePath, 'data');
  const replaceId = args.replaceId;

  if (replaceId) {
    const record = { id: replaceId, ...args.record } as ScreenRecord;
    return editFile(path, content => replaceById(content, replaceId, serializeScreenRecord(record)), [replaceId]);
  }
  return withAllocatedIds(root, 'screen', 1, ([id]) => {
    const record = { id: id as ScreenRecord['id'], ...args.record } as ScreenRecord;
    return editFile(path, content => insertBeforeArrayClose(content, serializeScreenRecord(record)), [id]);
  });
};

const writeConnections = (args: WriteConnectionsArgs): Promise<WriteRecordResult> => {
  const root = getWorkspaceRoot();
  const path = resolveSourceFile(root, args.filePath, 'data');

  if (args.mode === 'remove') {
    return editFile(path, content => removeById(content, args.connectionId), [args.connectionId]);
  }
  if (args.mode === 'replace') {
    const record = { id: args.connectionId, ...args.record } as ConnectionRecord;
    return editFile(path, content => replaceById(content, args.connectionId, serializeConnectionRecord(record)), [args.connectionId]);
  }
  const records = args.records;
  if (records.length === 0) return Promise.resolve({ success: false, error: 'insert needs at least one record' });
  return withAllocatedIds(root, 'connection', records.length, ids => {
    const code = records
      .map((record, i) => serializeConnectionRecord({ id: ids[i] as ConnectionRecord['id'], ...record } as ConnectionRecord))
      .join('\n');
    return editFile(path, content => insertBeforeArrayClose(content, code), ids);
  });
};

const registerScreenEditorHandlers = (): void => {
  // The six record-facade collections, whose channels are all one shape.
  registerRecordHandlers();
  // A brand-new crossing's pair mint. See connection-pair-writer.ts.
  registerConnectionPairHandler();

  handle('screenEditor:writeScreen', async (_e, args) => {
    try {
      return await writeScreen(args);
    } catch (e: unknown) {
      return failed(e);
    }
  });

  handle('screenEditor:writeConnections', async (_e, args) => {
    try {
      return await writeConnections(args);
    } catch (e: unknown) {
      return failed(e);
    }
  });

  // Check data still travels as text: shared/game/checks/ has not moved onto the
  // record facade yet, so there is no record shape to emit here.
  handle('screenEditor:writeCheck', async (_e, args) => {
    try {
      const path = resolveSourceFile(getWorkspaceRoot(), args.filePath, 'checks');
      const content = await readFile(path, 'utf-8');
      const result = args.checkId
        ? replaceById(content, args.checkId, args.code)
        : insertBeforeArrayClose(content, args.code);
      if (result.error) return { success: false, error: result.error };
      await writeFile(path, result.content, 'utf-8');
      return { success: true };
    } catch (e: unknown) {
      return failed(e);
    }
  });

  handle('screenEditor:allocateGeography', async (_e, args) => {
    try {
      return await allocateGeography(getWorkspaceRoot(), args);
    } catch (e: unknown) {
      return failed(e);
    }
  });

  handle('screenEditor:allocateTag', async (_e, args) => {
    try {
      return await allocateTag(getWorkspaceRoot(), args);
    } catch (e: unknown) {
      return failed(e);
    }
  });

  handle('screenEditor:writeTag', async (_e, args) => {
    try {
      return await writeTag(getWorkspaceRoot(), args);
    } catch (e: unknown) {
      return failed(e);
    }
  });

  handle('screenEditor:deleteTag', async (_e, args) => {
    try {
      return await deleteTag(getWorkspaceRoot(), args);
    } catch (e: unknown) {
      return failed(e);
    }
  });

  handle('screenEditor:allocateItemGroup', async (_e, args) => {
    try {
      return await allocateItemGroup(getWorkspaceRoot(), args);
    } catch (e: unknown) {
      return failed(e);
    }
  });

  handle('screenEditor:writeItemGroup', async (_e, args) => {
    try {
      return await writeItemGroup(getWorkspaceRoot(), args);
    } catch (e: unknown) {
      return failed(e);
    }
  });

  handle('screenEditor:deleteItemGroup', async (_e, args) => {
    try {
      return await deleteItemGroup(getWorkspaceRoot(), args);
    } catch (e: unknown) {
      return failed(e);
    }
  });

  handle('screenEditor:allocateEnumeration', async (_e, args) => {
    try {
      return await allocateEnumeration(getWorkspaceRoot(), args);
    } catch (e: unknown) {
      return failed(e);
    }
  });

  handle('screenEditor:writeEnumeration', async (_e, args) => {
    try {
      return await writeEnumeration(getWorkspaceRoot(), args);
    } catch (e: unknown) {
      return failed(e);
    }
  });

  handle('screenEditor:deleteEnumeration', async (_e, args) => {
    try {
      return await deleteEnumeration(getWorkspaceRoot(), args);
    } catch (e: unknown) {
      return failed(e);
    }
  });
};

export { registerScreenEditorHandlers };
