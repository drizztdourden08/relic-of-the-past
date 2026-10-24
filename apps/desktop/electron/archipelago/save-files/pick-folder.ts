/* @layer electron-main @kind logic */
import { dialog } from 'electron';
import { getMainWindow } from '@drizztdourden08/brock-electron/main';
import { FOLDER_DIALOG } from './save-files.constants';

/** The folder the player picks, or null when the picker is dismissed. */
const pickFolder = async (): Promise<string | null> => {
  const mainWindow = getMainWindow();
  const result = mainWindow
    ? await dialog.showOpenDialog(mainWindow, FOLDER_DIALOG)
    : await dialog.showOpenDialog(FOLDER_DIALOG);
  return result.canceled ? null : (result.filePaths[0] ?? null);
};

export { pickFolder };
