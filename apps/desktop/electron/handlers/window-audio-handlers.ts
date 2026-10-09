/* @layer electron-main @kind logic */
import { getMainWindow, handle } from '@drizztdourden08/brock-electron/main';
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';

const windowAudioHandlers: HandlerGroup = {
  id: 'window-audio',
  register: () => {
    handle('window:setAudioMuted', (_event, value) => {
      getMainWindow()?.webContents.setAudioMuted(value);
      return getMainWindow()?.webContents.isAudioMuted() ?? false;
    });
    handle('window:isAudioMuted', () => getMainWindow()?.webContents.isAudioMuted() ?? false);
  },
};

export { windowAudioHandlers };
