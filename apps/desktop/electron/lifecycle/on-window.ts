/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';
import { initAutoUpdater } from '../updater';
import { registerInputHandlers } from '../input';
import { registerMsulOpenHandler } from '../msu/open-file';
import { bootStoreLinks } from '../store/boot';
import { onFullscreenChange } from '../display/mode-switch';

const forwardDumpLayersConsole = (win: BrowserWindow): void => {
  if (!process.argv.some((arg) => arg.startsWith('--dump-layers='))) return;
  win.webContents.on('console-message', (event) => {
    // eslint-disable-next-line no-console
    console.log(`[renderer] ${event.message}`);
  });
};

const onWindow = (win: BrowserWindow): void => {
  initAutoUpdater(win);
  forwardDumpLayersConsole(win);
  registerInputHandlers(win);
  registerMsulOpenHandler(win);
  bootStoreLinks(win);
  win.on('enter-full-screen', () => onFullscreenChange(true));
  win.on('leave-full-screen', () => onFullscreenChange(false));
};

export { onWindow };
