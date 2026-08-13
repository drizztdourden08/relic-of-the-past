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
import { isAutomationLaunch, parseInstanceConfig } from '../instance';

const APP_TITLE = 'Relic of the Past';

let mainWindow: BrowserWindow | null = null;

const getMainWindow = (): BrowserWindow | null => {
  return mainWindow;
};

// NOTE: there is deliberately no "show it quietly" helper here any more.
// showInactive() + blur() + SetWindowPos(HWND_BOTTOM) was tried and still
// disturbed the user: appearing anywhere in the z-order drops a fullscreen game
// out of exclusive fullscreen, and the unconditional blur() pushed the foreground
// to the desktop instead of back to its owner. Hence the current approach — see
// offscreenOrigin() and the noFocus branch in createWindow.

/**
 * A position beyond every display, so an automation window sits on NO monitor.
 *
 * Keeping the window hidden outright is even quieter, but Chromium does not
 * schedule requestAnimationFrame for a hidden page, so the emulator never ticks
 * and any spec that PLAYS the game (rather than just reading a loaded state)
 * cannot advance. Off-screen keeps the window "shown" — frames run, CDP input
 * routes normally — while never compositing a pixel onto the user's screens.
 *
 * Derived from the real display layout rather than a magic negative constant, so
 * Windows cannot clamp it back onto a monitor.
 */
const offscreenOrigin = (): { x: number; y: number } => {
  const displays = screen.getAllDisplays();
  const right = Math.max(...displays.map((d) => d.bounds.x + d.bounds.width));
  const top = Math.min(...displays.map((d) => d.bounds.y));
  return { x: right + 400, y: top };
};

const createWindow = (): BrowserWindow => {
  const noFocus = isAutomationLaunch();
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
    title: instance.name ? `${APP_TITLE} — ${instance.name}` : APP_TITLE,
    icon: resolveWindowIcon(instance.name),
    backgroundColor: '#000000',
    // A normal launch is born transparent and is faded in by the boot mediator once
    // the renderer's shell has settled — see armReveal. Automation has no splash to
    // hand over from, so it stays opaque (and off-screen).
    opacity: noFocus ? 1 : 0,
    show: false,
    // An automation window must be UNABLE to take focus, not merely reluctant to.
    // focusable:false sets WS_EX_NOACTIVATE on Windows, so the OS refuses to
    // activate it at all — SetForegroundWindow (which is what Chromium's
    // Page.bringToFront ends up calling, and what a Playwright click triggers)
    // simply cannot succeed. Undoing focus after the fact was too late: by then
    // the user's own window had already been deactivated, which IS the complaint.
    // Playwright still drives the renderer fine — CDP input needs no OS focus.
    // On Windows this also implies skipTaskbar, so runs stop churning the taskbar.
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
    // Shown, but on no monitor (offscreenOrigin). "Shown" is what makes Chromium
    // schedule frames, so the emulator ticks and a spec can actually play the game
    // — which a fully hidden window cannot do. Off every display is what keeps the
    // user undisturbed: nothing is ever composited over their fullscreen session,
    // and focusable:false means it cannot take focus either.
    //
    // showInactive() rather than show(), so we never even ask to be activated.
    // keepWindowInBackground is the backstop if anything raises us later.
    //
    // Sized, never positioned: the saved SIZE keeps anything layout-sensitive matching
    // a real session, while the saved position would drag the window back onto a
    // display and into the user's way. Maximize/fullscreen are skipped for the same
    // reason, and because both would activate it.
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
    // show(), not showInactive(). The splash is a CHILD of this window, and a child of
    // a window that was never activated does not hold the foreground: it appeared for a
    // moment and then sank behind whatever the user already had open. Activating here
    // costs nothing visually, because this window is still at opacity 0, and it is the
    // correct behaviour anyway for a launch the user just asked for.
    //
    // The automation branch above is untouched and stays showInactive() with
    // focusable:false, so an automated launch still cannot take focus.
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

  // --muted is documented as mandatory alongside --no-focus for every automated
  // launch (docs/contributing/testing.md); enforced the same way so forgetting the
  // literal flag doesn't leave a headless run making noise.
  if (process.argv.includes('--muted') || isAutomationLaunch()) {
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

export { createWindow, getMainWindow };
