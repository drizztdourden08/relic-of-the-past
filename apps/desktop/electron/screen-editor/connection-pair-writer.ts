/* @layer electron-main @kind logic */
/**
 * Minting BOTH halves of a brand-new crossing atomically.
 *
 * Every `toConnectionId` is required (shared/game/data/types/connection.ts), so
 * a crossing with no partner mints two ids on ONE allocator turn and writes both
 * halves before either id is observable.
 *
 * The halves usually belong to different screens, so two file targets. Both
 * edits are validated before EITHER file is touched. If `writeFile` itself fails
 * between the two writes (a full disk), the near half is rolled back best-effort
 * so a dangling `toConnectionId` cannot survive silently.
 */

import { readFile, writeFile } from 'fs/promises';
import { serializeConnectionRecord } from '@shared/game/data/record-codegen';
import type { ConnectionRecord } from '@shared/game/data/types';
import type { WriteConnectionPairArgs, WriteConnectionPairResult } from '@shared/ipc/screen-editor-contract';
import { handle } from '../lib/ipc/handle';
import { resolveSourceFile } from './resolve-source-file';
import { insertBeforeArrayClose, removeById } from './source-writers';
import { withAllocatedIds } from './id-allocator';
import { getWorkspaceRoot } from './workspace-root';

const rolledBack = (msg: string): string => `The partner half failed to write (${msg}); the first half was rolled back.`;
const notRolledBack = (msg: string): string =>
  `The partner half failed to write (${msg}), and the first half could NOT be rolled back. Check the connections data for a dangling id.`;

const writeConnectionPair = (root: string, args: WriteConnectionPairArgs): Promise<WriteConnectionPairResult> => {
  const nearPath = resolveSourceFile(root, args.near.filePath, 'data');
  const farPath = resolveSourceFile(root, args.far.filePath, 'data');

  return withAllocatedIds(root, 'connection', 2, async ([nearId, farId]) => {
    const near = { id: nearId, ...args.near.record, toConnectionId: farId } as ConnectionRecord;
    const far = { id: farId, ...args.far.record, toConnectionId: nearId } as ConnectionRecord;
    const nearCode = serializeConnectionRecord(near);
    const farCode = serializeConnectionRecord(far);

    if (nearPath === farPath) {
      // One file, one edit: a mid-air failure cannot leave a dangling partner.
      const content = await readFile(nearPath, 'utf-8');
      const result = insertBeforeArrayClose(content, `${nearCode}\n${farCode}`);
      if (result.error) return { success: false, error: result.error };
      await writeFile(nearPath, result.content, 'utf-8');
      return { success: true, nearId: near.id, farId: far.id };
    }

    // Compute and validate both edits before writing anything.
    const nearContent = await readFile(nearPath, 'utf-8');
    const nearEdit = insertBeforeArrayClose(nearContent, nearCode);
    if (nearEdit.error) return { success: false, error: nearEdit.error };
    const farContent = await readFile(farPath, 'utf-8');
    const farEdit = insertBeforeArrayClose(farContent, farCode);
    if (farEdit.error) return { success: false, error: farEdit.error };

    await writeFile(nearPath, nearEdit.content, 'utf-8');
    try {
      await writeFile(farPath, farEdit.content, 'utf-8');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'unknown error';
      const rollback = removeById(nearEdit.content, near.id);
      if (rollback.error) return { success: false, error: notRolledBack(msg) };
      try {
        await writeFile(nearPath, rollback.content, 'utf-8');
      } catch {
        return { success: false, error: notRolledBack(msg) };
      }
      return { success: false, error: rolledBack(msg) };
    }
    return { success: true, nearId: near.id, farId: far.id };
  });
};

const failed = (e: unknown): { success: false; error: string } =>
  ({ success: false, error: e instanceof Error ? e.message : 'Unknown error' });

const registerConnectionPairHandler = (): void => {
  handle('screenEditor:writeConnectionPair', async (_e, args) => {
    try {
      return await writeConnectionPair(getWorkspaceRoot(), args);
    } catch (e: unknown) {
      return failed(e);
    }
  });
};

export { registerConnectionPairHandler, writeConnectionPair };
