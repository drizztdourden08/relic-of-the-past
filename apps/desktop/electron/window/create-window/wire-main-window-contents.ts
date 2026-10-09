/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';
import { attachTextInteraction } from '../text-interaction';
import { mainWindowState } from './main-window-state';

const isRendererKey = (key: string): boolean => /^F([1-9]|1[0-2])$/.test(key) || key === 'Tab';

const wireMainWindowContents = (win: BrowserWindow): void => {
  win.webContents.on('before-input-event', (_event, input) => {
    if (input.type === 'keyDown' && isRendererKey(input.key)) {
      mainWindowState.window!.webContents.setIgnoreMenuShortcuts(true);
    } else {
      mainWindowState.window!.webContents.setIgnoreMenuShortcuts(false);
    }
  });

  attachTextInteraction(win);

  win.webContents.session.setPermissionCheckHandler(() => true);
  win.webContents.session.setPermissionRequestHandler((_wc, _perm, callback) => {
    callback(true);
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    const { shell } = require('electron');
    shell.openExternal(url);
    return { action: 'deny' };
  });
};

export { wireMainWindowContents };
