import { ipcMain, BrowserWindow } from 'electron';
import { getMainWindow } from './create-window';

function registerWindowHandlers(): void {
  const win = () => getMainWindow();

  // Window controls
  ipcMain.on('window:minimize', () => win()?.minimize());
  ipcMain.on('window:maximize', () => {
    const w = win();
    if (w?.isMaximized()) {
      w.unmaximize();
    } else {
      w?.maximize();
    }
  });
  ipcMain.on('window:close', () => win()?.close());
  ipcMain.on('window:openDevTools', () => win()?.webContents.openDevTools());

  ipcMain.handle('window:isMaximized', () => win()?.isMaximized() ?? false);
  ipcMain.handle('window:setAlwaysOnTop', (_event, value: boolean) => {
    win()?.setAlwaysOnTop(value);
    return win()?.isAlwaysOnTop() ?? false;
  });
  ipcMain.handle('window:setAudioMuted', (_event, value: boolean) => {
    win()?.webContents.setAudioMuted(value);
    return win()?.webContents.isAudioMuted() ?? false;
  });
  ipcMain.handle('window:isAudioMuted', () => win()?.webContents.isAudioMuted() ?? false);

  ipcMain.on('window:toggleFullscreen', () => {
    const w = win();
    if (w) w.setFullScreen(!w.isFullScreen());
  });
  ipcMain.on('window:setFullscreen', (_e, value: boolean) => {
    const w = win();
    if (w) w.setFullScreen(value);
  });
  ipcMain.handle('window:isFullscreen', () => win()?.isFullScreen() ?? false);
}

export { registerWindowHandlers };
