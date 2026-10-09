/* @layer electron-main @kind logic */
import { handle } from '@drizztdourden08/brock-electron/main';
import { is } from '@electron-toolkit/utils';
import type { ShadowCastingProject } from '@rotp/game-core';
import { loadShadowProject, saveShadowProject, getScreenData } from './store';

const registerShadowCastingHandlers = (): void => {
  handle('shadow-casting:load', async () => {
    return await loadShadowProject();
  });

  handle('shadow-casting:save', async (_event, data: ShadowCastingProject) => {
    if (!is.dev) {
      throw new Error('Shadow casting data can only be saved in development mode');
    }
    await saveShadowProject(data);
    return { success: true };
  });

  handle('shadow-casting:get-screen', async (_event, screenId: number) => {
    return await getScreenData(screenId);
  });
};

export { registerShadowCastingHandlers };
