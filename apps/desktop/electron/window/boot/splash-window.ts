/* @layer electron-main @kind logic */
/**
 * The boot splash — its own frameless window, so the main window never has to be
 * splash-sized and then grow in front of the user.
 *
 * It is a CHILD of the main window rather than alwaysOnTop: a child floats above its
 * parent only, so a boot that happens while the user is in another app never covers
 * their work. It carries no preload and no bundle — plain markup that paints on the
 * first frame, driven from here through one tiny global.
 */
import { BrowserWindow, screen } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import { fadeWindow } from './fade-window';

// The size the boot splash has always been. Kept exactly, because the installer's
// animated splash is generated to match it frame for frame (scripts/build/make-installer-splash.mjs),
// so install and first launch read as one continuous thing.
const SPLASH_WIDTH = 480;
const SPLASH_HEIGHT = 360;

let splash: BrowserWindow | null = null;

/** Centred on the display the main window is on, not blindly on the primary one. */
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
  splash = new BrowserWindow({
    parent,
    ...splashOrigin(parent),
    width: SPLASH_WIDTH,
    height: SPLASH_HEIGHT,
    frame: false,
    resizable: false,
    // A frameless page with no -webkit-app-region:drag cannot be dragged anyway; this
    // is the second lock, against a window manager that offers its own move handle.
    movable: false,
    minimizable: false,
    maximizable: false,
    skipTaskbar: true,
    show: false,
    backgroundColor: '#000000',
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });

  loadSplashPage(splash, version);
  splash.once('ready-to-show', () => splash?.show());
};

/**
 * Status line under the spinner. Best-effort by design: the splash's job is done by
 * its logo and spinner, so a lost message must never be able to break the boot.
 */
const setSplashStatus = (message: string): void => {
  if (!splash || splash.isDestroyed()) return;
  const call = `window.__splashStatus?.(${JSON.stringify(message)})`;
  void splash.webContents.executeJavaScript(call).catch(() => undefined);
};

const closeSplash = (fadeMs: number): void => {
  const win = splash;
  splash = null;
  if (!win || win.isDestroyed()) return;
  fadeWindow(win, 0, fadeMs, () => {
    if (!win.isDestroyed()) win.destroy();
  });
};

export { openSplash, setSplashStatus, closeSplash };
