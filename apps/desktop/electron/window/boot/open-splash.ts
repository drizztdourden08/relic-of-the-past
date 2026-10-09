/* @layer electron-main @kind logic */
import { BrowserWindow, screen } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import { SPLASH_HEIGHT, SPLASH_WIDTH } from './splash-window.constants';
import { splashState } from './splash-state';

const splashOrigin = (parent: BrowserWindow): { x: number; y: number } => {
  const { workArea } = screen.getDisplayMatching(parent.getBounds());
  return {
    x: Math.round(workArea.x + (workArea.width - SPLASH_WIDTH) / 2),
    y: Math.round(workArea.y + (workArea.height - SPLASH_HEIGHT) / 2),
  };
};

const loadSplashPage = (win: BrowserWindow, version: string): void => {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    const url = new URL('/splash.html', process.env['ELECTRON_RENDERER_URL']);
    url.searchParams.set('v', version);
    void win.loadURL(url.toString());
    return;
  }
  void win.loadFile(join(__dirname, '../renderer/splash.html'), { query: { v: version } });
};

const openSplash = (parent: BrowserWindow, version: string): void => {
  const splash = new BrowserWindow({
    parent,
    ...splashOrigin(parent),
    width: SPLASH_WIDTH,
    height: SPLASH_HEIGHT,
    frame: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    skipTaskbar: true,
    show: false,
    backgroundColor: '#000000',
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });
  splashState.window = splash;

  loadSplashPage(splash, version);
  splash.once('ready-to-show', () => splashState.window?.show());
};

export { openSplash };
