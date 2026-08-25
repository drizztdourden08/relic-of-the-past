/* @layer electron-main @kind logic */
import { dialog } from 'electron';
import { readFile, writeFile } from 'fs/promises';
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

  // A cancelled dialog reports saved: false with no error — declining is not a failure.
  handle('dialog:saveFile', async (_event, name: string, data: ArrayBuffer, extensions: string[]) => {
    const mainWindow = getMainWindow();
    if (!mainWindow) return { saved: false, error: 'No window to attach the dialog to' };
    const filters = extensions.length
      ? [{ name: 'Files', extensions }, { name: 'All Files', extensions: ['*'] }]
      : [{ name: 'All Files', extensions: ['*'] }];
    const result = await dialog.showSaveDialog(mainWindow, { defaultPath: name, filters });
    if (result.canceled || !result.filePath) return { saved: false };
    try {
      await writeFile(result.filePath, Buffer.from(data));
      return { saved: true, name: basename(result.filePath) };
    } catch (err) {
      return { saved: false, error: err instanceof Error ? err.message : String(err) };
    }
  });
};

export { registerDialogHandlers };
