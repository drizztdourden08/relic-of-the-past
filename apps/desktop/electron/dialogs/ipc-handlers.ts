import { ipcMain, dialog } from 'electron';
import { getMainWindow } from '../window';

export const registerDialogHandlers = () => {
  ipcMain.handle('dialog:openRom', async () => {
    const mainWindow = getMainWindow();
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Zelda 3 ROM',
      filters: [
        { name: 'SNES ROM', extensions: ['sfc', 'smc'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });
};
