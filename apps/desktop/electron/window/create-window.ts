/* @layer electron-main @kind logic */
import { BrowserWindow, screen } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import { loadWindowState, trackWindowState } from './window-state';
import { parseStartupConfig, startupRendererArgs } from './startup-config';
import { keepWindowInBackground } from './keep-in-background';
import { attachTextInteraction } from './text-interaction';
import { resolveWindowIcon } from './window-icon';
import { isAutomationLaunch, parseInstanceConfig } from '../instance';

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

// Test/automation launches must never steal focus OR cover the user's other
// windows. Derived from isAutomationLaunch() rather than the literal --no-focus
// flag, so a run that carries --auto-state/--dump-nav/--sim-run/etc. but forgot
// --no-focus itself is still caught (see docs/contributing/testing.md — --no-focus
// is documented as mandatory, but forgetting it must not cost the user their
// focus). Tracked at module scope so restoreSavedBounds honours it too (its
// maximize/fullscreen calls would otherwise activate + raise the window).
let launchNoFocus = false;

// --window-size opens at a fixed size; the splash→saved-size growth is skipped so
// the window keeps exactly the requested resolution.
let fixedWindowSize = false;

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

/** Grow the splash-sized window to the last saved size/position/mode. Idempotent —
 *  fired by the renderer's app-ready signal, with a timeout fallback in createWindow. */
const restoreSavedBounds = (): void => {
  if (savedStateRestored || !mainWindow || !pendingSavedState) return;
  savedStateRestored = true;
  // A fixed --window-size launch keeps its requested resolution — no growth.
  if (fixedWindowSize) return;
  const saved = pendingSavedState;

  // An automation window lives off every monitor (see offscreenOrigin). Grow it to
  // the saved SIZE so anything layout-sensitive matches a real session, but never
  // apply the saved POSITION — that would drag it onto a display and back into the
  // user's way. Maximize/fullscreen are skipped for the same reason, and because
  // both would activate it.
  if (launchNoFocus) {
    mainWindow.setContentSize(saved.width, saved.height);
    return;
  }

  if (saved.x !== undefined && saved.y !== undefined) {
    mainWindow.setContentBounds({ x: saved.x, y: saved.y, width: saved.width, height: saved.height });
  } else {
    mainWindow.setContentSize(saved.width, saved.height);
    mainWindow.center();
  }

  // Start tracking normal bounds only now, so the splash size is never persisted.
  trackWindowState(mainWindow);

  if (saved.isMaximized) mainWindow.maximize();
  if (saved.isFullscreen) mainWindow.setFullScreen(true);
};

const createWindow = (): BrowserWindow => {
  const noFocus = isAutomationLaunch();
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
    // Automation opens off every monitor; centring would override that x/y.
    ...(noFocus ? offscreenOrigin() : {}),
    center: !noFocus,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    // A named instance carries its name in the title and swaps to the bot icon, so
    // parallel agent launches are tellable apart from the taskbar alone.
    title: instance.name ? `${APP_TITLE} — ${instance.name}` : APP_TITLE,
    icon: resolveWindowIcon(instance.name),
    backgroundColor: '#000000',
    show: !noFocus,
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
    // Shown, but on no monitor (offscreenOrigin). "Shown" is what makes Chromium
    // schedule frames, so the emulator ticks and a spec can actually play the game
    // — which a fully hidden window cannot do. Off every display is what keeps the
    // user undisturbed: nothing is ever composited over their fullscreen session,
    // and focusable:false means it cannot take focus either.
    //
    // showInactive() rather than show(), so we never even ask to be activated.
    // keepWindowInBackground is the backstop if anything raises us later.
    keepWindowInBackground(mainWindow);
    mainWindow.showInactive();
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

export { createWindow, getMainWindow, restoreSavedBounds };
