/* @layer electron-main @kind logic */
import { dialog } from 'electron';
import { readFile } from 'fs/promises';
import { basename } from 'path';
import { getMainWindow } from '../window';
import { handle } from '../lib/ipc/handle';
import { toArrayBuffer } from '../lib/buffer';

const registerDialogHandlers = () => {
  handle('dialog:openRom', async () => {
    const mainWindow = getMainWindow();
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select game ROM',
      filters: [
        { name: 'SNES ROM', extensions: ['sfc', 'smc'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  handle('dialog:pickFile', async (_event, extensions: string[]) => {
    const mainWindow = getMainWindow();
    if (!mainWindow) return null;
    const filters = extensions.length
      ? [{ name: 'Files', extensions }, { name: 'All Files', extensions: ['*'] }]
      : [{ name: 'All Files', extensions: ['*'] }];
    const result = await dialog.showOpenDialog(mainWindow, { filters, properties: ['openFile'] });
    if (result.canceled || result.filePaths.length === 0) return null;
    const picked = result.filePaths[0];
    return { name: basename(picked), data: toArrayBuffer(await readFile(picked)) };
  });
};

export { registerDialogHandlers };
