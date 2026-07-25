/* @layer electron-main @kind logic */
import { BrowserWindow } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import { loadWindowState, trackWindowState } from './window-state';
import { parseStartupConfig, startupRendererArgs } from './startup-config';
import { sendWindowToBack } from './send-to-back';
import { attachTextInteraction } from './text-interaction';
import { resolveWindowIcon } from './window-icon';
import { parseInstanceConfig } from '../instance';

const APP_TITLE = 'Relic of the Past';

let mainWindow: BrowserWindow | null = null;

// The window opens at this fixed size to frame the boot splash, then grows to the
// saved size once the renderer signals it's ready (restoreSavedBounds below).
const SPLASH_WIDTH = 480;
const SPLASH_HEIGHT = 360;

// Saved bounds are captured at creation but applied only on app-ready, so the
// splash never flashes at the (possibly maximized) full size first.
let pendingSavedState: ReturnType<typeof loadWindowState> | null = null;
let savedStateRestored = false;

// --no-focus (test/automation) launches must never steal focus OR cover the
// user's other windows. Tracked at module scope so restoreSavedBounds honours it
// too (its maximize/fullscreen calls would otherwise activate + raise the window).
let launchNoFocus = false;

// --window-size opens at a fixed size; the splash→saved-size growth is skipped so
// the window keeps exactly the requested resolution.
let fixedWindowSize = false;

const getMainWindow = (): BrowserWindow | null => {
  return mainWindow;
};

/** Show the window without activating it, then drop it behind other apps. */
const showInBackground = (win: BrowserWindow): void => {
  win.setAlwaysOnTop(false);
  win.showInactive();
  win.blur();
  // showInactive avoids focus but still lands on top of the z-order on Windows;
  // SetWindowPos(HWND_BOTTOM) actually puts us behind the user's other windows.
  sendWindowToBack(win);
};

/** Grow the splash-sized window to the last saved size/position/mode. Idempotent —
 *  fired by the renderer's app-ready signal, with a timeout fallback in createWindow. */
const restoreSavedBounds = (): void => {
  if (savedStateRestored || !mainWindow || !pendingSavedState) return;
  savedStateRestored = true;
  // A fixed --window-size launch keeps its requested resolution — no growth.
  if (fixedWindowSize) return;
  const saved = pendingSavedState;

  if (saved.x !== undefined && saved.y !== undefined) {
    mainWindow.setContentBounds({ x: saved.x, y: saved.y, width: saved.width, height: saved.height });
  } else {
    mainWindow.setContentSize(saved.width, saved.height);
    if (!launchNoFocus) mainWindow.center();
  }

  // Start tracking normal bounds only now, so the splash size is never persisted.
  trackWindowState(mainWindow);

  // In no-focus mode, never maximize/fullscreen (both activate + raise the
  // window). Re-assert the inactive/background state after the resize instead.
  if (launchNoFocus) {
    showInBackground(mainWindow);
    return;
  }

  if (saved.isMaximized) mainWindow.maximize();
  if (saved.isFullscreen) mainWindow.setFullScreen(true);
};

const createWindow = (): BrowserWindow => {
  const noFocus = process.argv.includes('--no-focus');
  launchNoFocus = noFocus;
  const startup = parseStartupConfig();
  const instance = parseInstanceConfig();
  fixedWindowSize = startup.windowSize !== null;
  pendingSavedState = loadWindowState();
  savedStateRestored = false;

  mainWindow = new BrowserWindow({
    width: startup.windowSize?.width ?? SPLASH_WIDTH,
    height: startup.windowSize?.height ?? SPLASH_HEIGHT,
    minWidth: 360,
    minHeight: 280,
    center: true,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    // A named instance carries its name in the title and swaps to the bot icon, so
    // parallel agent launches are tellable apart from the taskbar alone.
    title: instance.name ? `${APP_TITLE} — ${instance.name}` : APP_TITLE,
    icon: resolveWindowIcon(instance.name),
    backgroundColor: '#000000',
    show: !noFocus,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      // The game loop drives on rAF; keep it running at full speed when the
      // window is unfocused (e.g. --no-focus automation) instead of throttled.
      backgroundThrottling: false,
      // Forward test/automation layout flags to the renderer (read in preload).
      additionalArguments: startupRendererArgs(startup),
    },
  });

  // Fallback: if the renderer never signals ready (crash/hang), grow anyway.
  setTimeout(restoreSavedBounds, 10000);

  // The WASM core sets an SDL window title (kWindowTitle in emscripten_main.c), which
  // reaches document.title and overrides the BrowserWindow title — so without this an
  // instance name never shows in the window or on the taskbar. Hold our own title for a
  // named instance; a normal launch keeps whatever it does today.
  if (instance.name) {
    const instanceTitle = `${APP_TITLE} — ${instance.name}`;
    mainWindow.on('page-title-updated', (event) => {
      event.preventDefault();
      mainWindow?.setTitle(instanceTitle);
    });
  }

  if (noFocus) {
    showInBackground(mainWindow);
    // Re-assert the background position once the first paint is ready (showing the
    // painted frame can otherwise bounce the window back to the top of the z-order).
    mainWindow.once('ready-to-show', () => { if (mainWindow) sendWindowToBack(mainWindow); });
  }

  // Let F1-F12 (and Tab) pass through to the renderer instead of being
  // consumed by Electron menu accelerators.
  mainWindow.webContents.on('before-input-event', (_event, input) => {
    if (input.type === 'keyDown' && (
      /^F([1-9]|1[0-2])$/.test(input.key) ||
      input.key === 'Tab'
    )) {
      mainWindow!.webContents.setIgnoreMenuShortcuts(true);
    } else {
      mainWindow!.webContents.setIgnoreMenuShortcuts(false);
    }
  });

  // Right-click Copy/Paste menu + guaranteed Ctrl/Cmd+C copy.
  attachTextInteraction(mainWindow);

  // Allow gamepad and other device permissions for the renderer
  mainWindow.webContents.session.setPermissionCheckHandler(() => true);
  mainWindow.webContents.session.setPermissionRequestHandler((_wc, _perm, callback) => {
    callback(true);
  });

  if (process.argv.includes('--muted')) {
    mainWindow.webContents.setAudioMuted(true);
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const { shell } = require('electron');
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  return mainWindow;
};

export { createWindow, getMainWindow, restoreSavedBounds };
