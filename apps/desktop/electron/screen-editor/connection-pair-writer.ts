/* @layer electron-main @kind logic */
/**
 * Minting BOTH halves of a brand-new crossing atomically.
 *
 * A connection point only makes sense paired with its partner (see
 * shared/game/data/types/connection.ts): every `toConnectionId` is required,
 * never optional. So a create for a crossing with no existing partner mints
 * two ids on ONE allocator turn (`withAllocatedIds`'s `count`) and writes both
 * halves before either id is observable anywhere — nothing can allocate in
 * between, and nothing can see a `toConnectionId` naming a record that was
 * never actually written.
 *
 * The two halves usually belong to different screens, hence two independent
 * file targets rather than the one `writeConnections` (insert mode) assumes.
 * Both computed edits are validated (read + `insertBeforeArrayClose`) before
 * EITHER file is touched, so a bad path or a malformed array on either side
 * fails with nothing written at all. The remaining risk — `writeFile` itself
 * failing between the two writes, e.g. a full disk — is narrow, and the near
 * half (already on disk at that point) is rolled back on a best-effort basis
 * so a dangling `toConnectionId` cannot survive it silently.
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
  `The partner half failed to write (${msg}), and the first half could NOT be rolled back — check the connections data for a dangling id.`;

const writeConnectionPair = (root: string, args: WriteConnectionPairArgs): Promise<WriteConnectionPairResult> => {
  const nearPath = resolveSourceFile(root, args.near.filePath, 'data');
  const farPath = resolveSourceFile(root, args.far.filePath, 'data');

  return withAllocatedIds(root, 'connection', 2, async ([nearId, farId]) => {
    const near = { id: nearId, ...args.near.record, toConnectionId: farId } as ConnectionRecord;
    const far = { id: farId, ...args.far.record, toConnectionId: nearId } as ConnectionRecord;
    const nearCode = serializeConnectionRecord(near);
    const farCode = serializeConnectionRecord(far);

    if (nearPath === farPath) {
      // One file, one edit: both halves land in the same write, so a mid-air
      // failure cannot leave either one referencing an unwritten partner.
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
