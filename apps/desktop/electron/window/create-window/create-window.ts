/* @layer electron-main @kind logic */
import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import { loadWindowState, applyWindowState, trackWindowState } from '../window-state';
import type { WindowState } from '../window-state';
import { parseStartupConfig } from '../startup-config';
import type { StartupConfig } from '../startup-config';
import { keepWindowInBackground } from '../keep-in-background';
import { armReveal, openSplash } from '../boot';
import { isHeadlessLaunch, parseInstanceConfig } from '../../instance';
import { APP_TITLE } from './create-window.constants';
import { mainWindowOptions } from './main-window-options';
import { mainWindowState } from './main-window-state';
import { wireMainWindowContents } from './wire-main-window-contents';

const holdInstanceTitle = (win: BrowserWindow, instanceName: string): void => {
  const instanceTitle = `${APP_TITLE} - ${instanceName}`;
  win.on('page-title-updated', (event) => {
    event.preventDefault();
    mainWindowState.window?.setTitle(instanceTitle);
  });
};

const showOffEveryMonitor = (win: BrowserWindow, startup: StartupConfig, saved: WindowState): void => {
  if (!startup.windowSize) win.setContentSize(saved.width, saved.height);
  keepWindowInBackground(win);
  win.showInactive();
};

const showBehindSplash = (win: BrowserWindow, startup: StartupConfig, saved: WindowState): void => {
  if (startup.windowSize) win.center();
  else applyWindowState(win, saved);
  trackWindowState(win);
  armReveal(win);
  win.show();
  openSplash(win, app.getVersion());
};

const loadRenderer = (win: BrowserWindow): void => {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'));
  }
};

const createWindow = (): BrowserWindow => {
  const noFocus = isHeadlessLaunch();
  const startup = parseStartupConfig();
  const instance = parseInstanceConfig();
  const saved = loadWindowState();

  const mainWindow = new BrowserWindow(mainWindowOptions(noFocus, startup, instance.name, saved));
  mainWindowState.window = mainWindow;

  if (instance.name) holdInstanceTitle(mainWindow, instance.name);

  if (noFocus) showOffEveryMonitor(mainWindow, startup, saved);
  else showBehindSplash(mainWindow, startup, saved);

  wireMainWindowContents(mainWindow);
  loadRenderer(mainWindow);

  return mainWindow;
};

export { createWindow };
