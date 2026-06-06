import { ipcMain } from 'electron';
import { is } from '@electron-toolkit/utils';
import type { ShadowCastingProject } from '../../../../shared/types/shadow-casting';
import { loadShadowProject, saveShadowProject, getScreenData } from './store';

const registerShadowCastingHandlers = (): void => {
  ipcMain.handle('shadow-casting:load', async () => {
    return await loadShadowProject();
  });

  ipcMain.handle('shadow-casting:save', async (_event, data: ShadowCastingProject) => {
    if (!is.dev) {
      throw new Error('Shadow casting data can only be saved in development mode');
    }
    await saveShadowProject(data);
    return { success: true };
  });

  ipcMain.handle('shadow-casting:get-screen', async (_event, screenId: number) => {
    return await getScreenData(screenId);
  });
};

export { registerShadowCastingHandlers };
