/* @layer electron-main @kind logic */
/**
 * IPC handlers for the Screen/Connection editor wizards.
 * Reads/writes to the shared/game/data/ and shared/game/checks/ source files.
 */

import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { handle } from '../lib/ipc/handle';
import { resolveSourceFile } from './resolve-source-file';
import { escapeSingleQuote, insertBeforeArrayClose, replaceById, removeConnectionByEndpoints, replaceConnectionByEndpoints } from './source-writers';

let cachedWorkspaceRoot: string | null = null;

// Walk up from `start` looking for the ancestor that contains shared/game/data
// — a reliable anchor for the repo root. A fixed relative depth (eg.
// '../../../..' from __dirname) breaks as soon as the bundler changes how many
// directories deep this file lands: dev, the electron-vite production build,
// and a packaged app all bundle this handler at different depths.
const findRepoRoot = (start: string): string | null => {
  let dir = start;
  for (;;) {
    if (existsSync(join(dir, 'shared', 'game', 'data'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
};

// Resolve the workspace root by walking up from this file's location, falling
// back to the process working directory (the app is always launched from the
// repo root, so this covers the case where the bundled output moved outside
// the source tree entirely, eg. a packaged build). Cached since it never
// changes for the lifetime of the process.
const getWorkspaceRoot = (): string => {
  if (cachedWorkspaceRoot) return cachedWorkspaceRoot;
  cachedWorkspaceRoot = findRepoRoot(__dirname) ?? findRepoRoot(process.cwd()) ?? process.cwd();
  return cachedWorkspaceRoot;
};

const resolveDataFile = (root: string, relPath: string): string =>
  resolveSourceFile(root, relPath, 'data');

const resolveCheckFile = (root: string, relPath: string): string =>
  resolveSourceFile(root, relPath, 'checks');

const registerScreenEditorHandlers = (): void => {
  // Write a screen definition to source file
  handle('screenEditor:writeScreen', async (_e, args: {
    filePath: string; // relative to shared/game/data/
    code: string;
    screenId: string | null; // null = insert new, string = replace existing
  }) => {
    try {
      const root = getWorkspaceRoot();
      const fullPath = resolveDataFile(root, args.filePath);

      const content = await readFile(fullPath, 'utf-8');

      const result = args.screenId
        ? replaceById(content, args.screenId, args.code)
        : insertBeforeArrayClose(content, args.code);
      if (result.error) {
        return { success: false, error: result.error };
      }

      await writeFile(fullPath, result.content, 'utf-8');
      return { success: true };
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  });

  // Write connections to source file. Insert (default), remove, or replace an
  // entry identified by its `from`/`to` endpoints.
  handle('screenEditor:writeConnections', async (_e, args: {
    filePath: string; // relative to shared/game/data/
    code?: string;
    mode?: 'insert' | 'remove' | 'replace';
    from?: string;
    to?: string;
  }) => {
    try {
      const root = getWorkspaceRoot();
      const fullPath = resolveDataFile(root, args.filePath);

      const content = await readFile(fullPath, 'utf-8');
      const mode = args.mode ?? 'insert';

      let result: { content: string; error?: string };
      if (mode === 'remove') {
        if (!args.from || !args.to) return { success: false, error: 'remove needs from and to' };
        result = removeConnectionByEndpoints(content, args.from, args.to);
      } else if (mode === 'replace') {
        if (!args.from || !args.to || !args.code) return { success: false, error: 'replace needs from, to and code' };
        result = replaceConnectionByEndpoints(content, args.from, args.to, args.code);
      } else {
        if (!args.code) return { success: false, error: 'insert needs code' };
        result = insertBeforeArrayClose(content, args.code);
      }
      if (result.error) {
        return { success: false, error: result.error };
      }

      await writeFile(fullPath, result.content, 'utf-8');
      return { success: true };
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  });

  // Write a check-data update to source file (shared/game/checks/)
  handle('screenEditor:writeCheck', async (_e, args: {
    filePath: string; // relative to shared/game/checks/
    code: string;
    checkId: string | null; // null = insert new, string = replace existing
  }) => {
    try {
      const root = getWorkspaceRoot();
      const fullPath = resolveCheckFile(root, args.filePath);

      const content = await readFile(fullPath, 'utf-8');

      const result = args.checkId
        ? replaceById(content, args.checkId, args.code)
        : insertBeforeArrayClose(content, args.code);
      if (result.error) {
        return { success: false, error: result.error };
      }

      await writeFile(fullPath, result.content, 'utf-8');
      return { success: true };
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  });

  // Append new area/location entries to registry files
  handle('screenEditor:appendRegistry', async (_e, args: {
    type: 'area' | 'location';
    entries: Array<{ id: string; name: string; world?: string; areaId?: string }>;
  }) => {
    try {
      const root = getWorkspaceRoot();
      const file = args.type === 'area' ? 'screens/areas.ts' : 'screens/locations.ts';
      const fullPath = join(root, 'shared', 'game', 'data', file);

      const content = await readFile(fullPath, 'utf-8');

      const lines = args.entries.map(entry => {
        if (args.type === 'area') {
          return `  { id: '${entry.id}', name: '${escapeSingleQuote(entry.name)}', world: '${entry.world ?? 'light'}' },`;
        }
        return `  { id: '${entry.id}', name: '${escapeSingleQuote(entry.name)}', areaId: '${entry.areaId}' },`;
      });

      const result = insertBeforeArrayClose(content, lines.join('\n'));
      if (result.error) {
        return { success: false, error: result.error };
      }

      await writeFile(fullPath, result.content, 'utf-8');
      return { success: true };
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  });
};

export { registerScreenEditorHandlers };
