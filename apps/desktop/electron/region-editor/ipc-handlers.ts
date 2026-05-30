/**
 * IPC handlers for the Region/Connection editor wizards.
 * Reads/writes to the shared/game/data/ source files.
 */

import { ipcMain, app } from 'electron';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

/** Resolve workspace root (parent of apps/) */
function getWorkspaceRoot(): string {
  // In dev: __dirname = apps/desktop/electron/region-editor
  // In prod: this feature is dev-only, but fallback to app path
  if (app.isPackaged) {
    return join(app.getAppPath(), '../../..');
  }
  return join(__dirname, '../../../..');
}

function registerRegionEditorHandlers(): void {
  // Write a region definition to source file
  ipcMain.handle('regionEditor:writeRegion', async (_e, args: {
    filePath: string; // relative to shared/game/data/
    code: string;
    regionId: string | null; // null = insert new, string = replace existing
  }) => {
    try {
      const root = getWorkspaceRoot();
      const fullPath = join(root, 'shared', 'game', 'data', args.filePath);

      const content = await readFile(fullPath, 'utf-8');

      let newContent: string;
      if (args.regionId) {
        // Replace existing: find the object with matching id
        const idPattern = new RegExp(
          `(\\{[^}]*id:\\s*'${escapeRegex(args.regionId)}'[^}]*\\},?)`,
          's',
        );
        const match = content.match(idPattern);
        if (!match) {
          return { success: false, error: `Could not find region '${args.regionId}' in file` };
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
  ipcMain.handle('regionEditor:writeConnections', async (_e, args: {
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
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export { registerRegionEditorHandlers };
