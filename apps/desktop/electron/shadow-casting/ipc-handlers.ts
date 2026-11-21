/* @layer electron-main @kind logic */
import { handle } from '@drizztdourden08/brock-electron/main';
import { is } from '@electron-toolkit/utils';
import { msg } from '@drizztdourden08/brock-core/i18n';
import { mainText } from '../lib/main-text';
import type { ShadowCastingProject } from '@rotp/game-core';
import { loadShadowProject, saveShadowProject, getScreenData } from './store';

const registerShadowCastingHandlers = (): void => {
  handle('shadow-casting:load', () => loadShadowProject());

  handle('shadow-casting:save', async (_event, data: ShadowCastingProject) => {
    if (!is.dev) {
      throw new Error(mainText(msg('screen-editor:shadow.devOnly')));
    }
    await saveShadowProject(data);
    return { success: true };
  });

  handle('shadow-casting:get-screen', (_event, screenId: number) => getScreenData(screenId));
};

export { registerShadowCastingHandlers };
