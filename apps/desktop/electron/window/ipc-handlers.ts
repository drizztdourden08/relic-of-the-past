/* @layer electron-main @kind logic */
import { getMainWindow } from './create-window';
import { handle, on } from '../lib/ipc/handle';

const registerWindowHandlers = (): void => {
  const win = () => getMainWindow();

  // Window controls
  on('window:minimize', () => win()?.minimize());
  on('window:maximize', () => {
    const w = win();
    if (w?.isMaximized()) {
      w.unmaximize();
    } else {
      w?.maximize();
    }
  });
  on('window:close', () => win()?.close());
  on('window:openDevTools', () => win()?.webContents.openDevTools());

  handle('window:isMaximized', () => win()?.isMaximized() ?? false);
  handle('window:setAlwaysOnTop', (_event, value: boolean) => {
    win()?.setAlwaysOnTop(value);
    return win()?.isAlwaysOnTop() ?? false;
  });
  handle('window:setAudioMuted', (_event, value: boolean) => {
    win()?.webContents.setAudioMuted(value);
    return win()?.webContents.isAudioMuted() ?? false;
  });
  handle('window:isAudioMuted', () => win()?.webContents.isAudioMuted() ?? false);

  on('window:toggleFullscreen', () => {
    const w = win();
    if (w) w.setFullScreen(!w.isFullScreen());
  });
  on('window:setFullscreen', (_e, value: boolean) => {
    const w = win();
    if (w) w.setFullScreen(value);
  });
  handle('window:isFullscreen', () => win()?.isFullScreen() ?? false);
};

export { registerWindowHandlers };
