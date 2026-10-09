/* @layer electron-main @kind logic */
import { dialog } from 'electron';
import { getMainWindow, handle } from '@drizztdourden08/brock-electron/main';
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { ROM_DIALOG_FILTERS } from './dialog-handlers.constants';

const openRom = async (): Promise<string | null> => {
  const mainWindow = getMainWindow();
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select game ROM',
    filters: ROM_DIALOG_FILTERS,
    properties: ['openFile'],
  });
  if (result.canceled) return null;
  return result.filePaths[0] ?? null;
};

const dialogHandlers: HandlerGroup = {
  id: 'dialog',
  register: () => {
    handle('dialog:openRom', openRom);
  },
};

export { dialogHandlers };
