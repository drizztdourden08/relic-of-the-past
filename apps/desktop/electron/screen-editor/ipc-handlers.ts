/* @layer electron-main @kind logic */
/**
 * IPC handlers for the Screen/Connection editor wizards.
 * Reads/writes to the shared/game/data/ source files.
 */

import { ipcMain, app } from 'electron';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const getWorkspaceRoot = (): string => {
  // In dev: __dirname = apps/desktop/electron/screen-editor
  // In prod: this feature is dev-only, but fallback to app path
  if (app.isPackaged) {
    return join(app.getAppPath(), '../../..');
  }
  return join(__dirname, '../../../..');
};

const registerScreenEditorHandlers = (): void => {
  // Write a screen definition to source file
  ipcMain.handle('screenEditor:writeScreen', async (_e, args: {
    filePath: string; // relative to shared/game/data/
    code: string;
    screenId: string | null; // null = insert new, string = replace existing
  }) => {
    try {
      const root = getWorkspaceRoot();
      const fullPath = join(root, 'shared', 'game', 'data', args.filePath);

      const content = await readFile(fullPath, 'utf-8');

      let newContent: string;
      if (args.screenId) {
        // Replace existing: find the object with matching id
        const idPattern = new RegExp(
          `(\\{[^}]*id:\\s*'${escapeRegex(args.screenId)}'[^}]*\\},?)`,
          's',
        );
        const match = content.match(idPattern);
        if (!match) {
          return { success: false, error: `Could not find screen '${args.screenId}' in file` };
        }
        newContent = content.replace(match[0], args.code);
      } else {
        // Insert new: find the last ] that closes the array and insert before it
        const lastBracket = content.lastIndexOf('];');
        if (lastBracket === -1) {
          return { success: false, error: 'Could not find array closing bracket in file' };
        }
        newContent = content.slice(0, lastBracket) + args.code + '\n' + content.slice(lastBracket);
      }

      await writeFile(fullPath, newContent, 'utf-8');
      return { success: true };
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  });

  // Write connections to source file
  ipcMain.handle('screenEditor:writeConnections', async (_e, args: {
    filePath: string; // relative to shared/game/data/
    code: string;
  }) => {
    try {
      const root = getWorkspaceRoot();
      const fullPath = join(root, 'shared', 'game', 'data', args.filePath);

      const content = await readFile(fullPath, 'utf-8');

      // Insert before the last ];
      const lastBracket = content.lastIndexOf('];');
      if (lastBracket === -1) {
        return { success: false, error: 'Could not find array closing bracket in file' };
      }
      const newContent = content.slice(0, lastBracket) + args.code + '\n' + content.slice(lastBracket);

      await writeFile(fullPath, newContent, 'utf-8');
      return { success: true };
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  });

  // Append new area/location entries to registry files
  ipcMain.handle('screenEditor:appendRegistry', async (_e, args: {
    type: 'area' | 'location';
    entries: Array<{ id: string; name: string; world?: string; areaId?: string }>;
  }) => {
    try {
      const root = getWorkspaceRoot();
      const file = args.type === 'area' ? 'screens/areas.ts' : 'screens/locations.ts';
      const fullPath = join(root, 'shared', 'game', 'data', file);

      const content = await readFile(fullPath, 'utf-8');
      const lastBracket = content.lastIndexOf('];');
      if (lastBracket === -1) {
        return { success: false, error: 'Could not find array end in registry file' };
      }

      const lines = args.entries.map(entry => {
        if (args.type === 'area') {
          return `  { id: '${entry.id}', name: '${escapeSingleQuote(entry.name)}', world: '${entry.world ?? 'light'}' },`;
        }
        return `  { id: '${entry.id}', name: '${escapeSingleQuote(entry.name)}', areaId: '${entry.areaId}' },`;
      });

      const newContent = content.slice(0, lastBracket) + lines.join('\n') + '\n' + content.slice(lastBracket);
      await writeFile(fullPath, newContent, 'utf-8');
      return { success: true };
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  });
};

const escapeRegex = (s: string): string => {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const escapeSingleQuote = (s: string): string => {
  return s.replace(/'/g, "\\'");
};

export { registerScreenEditorHandlers };
