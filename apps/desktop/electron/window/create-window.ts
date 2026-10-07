/* @layer electron-main @kind logic */
import { app, BrowserWindow, screen } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import { loadWindowState, applyWindowState, trackWindowState } from './window-state';
import { parseStartupConfig, startupRendererArgs } from './startup-config';
import { keepWindowInBackground } from './keep-in-background';
import { attachTextInteraction } from './text-interaction';
import { resolveWindowIcon } from './window-icon';
import { armReveal, openSplash } from './boot';
import { isHeadlessLaunch, parseInstanceConfig } from '../instance';

const APP_TITLE = 'Relic of the Past';

let mainWindow: BrowserWindow | null = null;

const getMainWindow = (): BrowserWindow | null => {
  return mainWindow;
};

// No "show in background" helper: showInactive() + blur() + SetWindowPos(HWND_BOTTOM)
// still dropped a fullscreen game out of exclusive fullscreen and pushed the foreground
// to the desktop. See offscreenOrigin() and the noFocus branch below.

/**
 * A position beyond every display, so an automation window sits on NO monitor.
 * A hidden window gets no requestAnimationFrame, so the emulator never ticks;
 * off-screen keeps it "shown" (frames run, CDP input routes) without compositing
 * a pixel. Derived from the real display layout so Windows cannot clamp it back.
 */
const offscreenOrigin = (): { x: number; y: number } => {
  const displays = screen.getAllDisplays();
  const right = Math.max(...displays.map((d) => d.bounds.x + d.bounds.width));
  const top = Math.min(...displays.map((d) => d.bounds.y));
  return { x: right + 400, y: top };
};

const createWindow = (): BrowserWindow => {
  const noFocus = isHeadlessLaunch();
  const startup = parseStartupConfig();
  const instance = parseInstanceConfig();
  const saved = loadWindowState();

  mainWindow = new BrowserWindow({
    width: startup.windowSize?.width ?? saved.width,
    height: startup.windowSize?.height ?? saved.height,
    minWidth: 360,
    minHeight: 280,
    // Automation opens off every monitor; centring would override that x/y.
    ...(noFocus ? offscreenOrigin() : {}),
    // Positioned by applyWindowState below, while still invisible.
    center: false,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    // A named instance carries its name in the title and swaps to the bot icon, so
    // parallel agent launches are tellable apart from the taskbar alone.
    title: instance.name ? `${APP_TITLE} - ${instance.name}` : APP_TITLE,
    icon: resolveWindowIcon(instance.name),
    backgroundColor: '#000000',
    // A normal launch starts transparent and is faded in by armReveal once the
    // renderer's shell has settled. Automation has no splash, so it stays opaque.
    opacity: noFocus ? 1 : 0,
    show: false,
    // focusable:false sets WS_EX_NOACTIVATE on Windows, so SetForegroundWindow (what
    // Page.bringToFront and a Playwright click end up calling) cannot succeed. Undoing
    // focus after the fact was too late: the user's window was already deactivated.
    // CDP input needs no OS focus. On Windows this also implies skipTaskbar.
    focusable: !noFocus,
    // Paint even before/without being on a visible surface, so an off-screen
    // automation run still renders for screenshots.
    paintWhenInitiallyHidden: true,
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

  // The WASM core's SDL window title (kWindowTitle in emscripten_main.c) reaches
  // document.title and would override the instance name, so hold our own title.
  if (instance.name) {
    const instanceTitle = `${APP_TITLE} - ${instance.name}`;
    mainWindow.on('page-title-updated', (event) => {
      event.preventDefault();
      mainWindow?.setTitle(instanceTitle);
    });
  }

  if (noFocus) {
    // Shown on no monitor: "shown" makes Chromium schedule frames, off-screen keeps
    // the user undisturbed. showInactive() so we never ask to be activated;
    // keepWindowInBackground is the backstop. Saved SIZE only: the saved position
    // (or maximize/fullscreen) would drag the window back onto a display.
    if (!startup.windowSize) mainWindow.setContentSize(saved.width, saved.height);
    keepWindowInBackground(mainWindow);
    mainWindow.showInactive();
  } else {
    // Everything that moves the window happens here, while it is still transparent:
    // by the time the user sees it, its geometry is final and its UI has settled.
    if (startup.windowSize) mainWindow.center();
    else applyWindowState(mainWindow, saved);
    trackWindowState(mainWindow);
    armReveal(mainWindow);
    // show(), not showInactive(): the splash is a CHILD of this window, and a child of
    // a never-activated window sinks behind whatever the user had open. Activating
    // costs nothing visually because this window is still at opacity 0.
    mainWindow.show();
    openSplash(mainWindow, app.getVersion());
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

  // No setAudioMuted here: it is a webContents kill switch the in-app audio state
  // cannot see or undo. --muted is forwarded to the renderer (startup-config) and
  // starts the app's own master volume at zero instead.

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

export { createWindow, getMainWindow };
