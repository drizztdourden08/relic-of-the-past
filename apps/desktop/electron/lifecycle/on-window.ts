/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';
import { registerDevicePermissions } from '../input';

const forwardDumpLayersConsole = (win: BrowserWindow): void => {
  if (!process.argv.some((arg) => arg.startsWith('--dump-layers='))) return;
  win.webContents.on('console-message', (event) => {
    console.log(`[renderer] ${event.message}`);
  });
};

const onWindow = (win: BrowserWindow): void => {
  forwardDumpLayersConsole(win);
  registerDevicePermissions(win);
};

export { onWindow };
