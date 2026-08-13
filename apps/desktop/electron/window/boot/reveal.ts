/* @layer electron-main @kind logic */
/**
 * Boot mediator — the one place that knows both the splash and the main window exist.
 *
 * The splash never references the main window and the main window never references the
 * splash; the renderer's shell-ready signal lands here and this module performs the
 * swap. Idempotent, because three separate things can trigger it: the signal itself, a
 * watchdog, and a dead renderer. A boot that goes wrong must still end with a visible
 * window — an invisible app is a worse failure than an ugly one.
 */
import type { BrowserWindow } from 'electron';
import { fadeWindow } from './fade-window';
import { closeSplash } from './splash-window';

const REVEAL_MS = 220;
const WATCHDOG_MS = 8000;

let target: BrowserWindow | null = null;
let watchdog: NodeJS.Timeout | null = null;
let revealed = true;

const revealMainWindow = (): void => {
  if (revealed) return;
  revealed = true;

  const win = target;
  target = null;
  if (watchdog) clearTimeout(watchdog);
  watchdog = null;

  closeSplash(REVEAL_MS);
  if (!win || win.isDestroyed()) return;

  // A transparent window is still hit-testable, so clicks were being swallowed while it
  // could not be seen (see armReveal).
  win.setIgnoreMouseEvents(false);
  fadeWindow(win, 1, REVEAL_MS, () => {
    if (!win.isDestroyed()) win.focus();
  });
};

/**
 * Hold `win` invisible until the renderer says its shell has settled.
 *
 * Opacity, not show:false — Chromium does not schedule requestAnimationFrame for a
 * hidden page, so a hidden window would mount React into a stalled frame loop. A shown
 * window at opacity 0 lays out and paints normally while compositing nothing the user
 * can see.
 */
const armReveal = (win: BrowserWindow): void => {
  target = win;
  revealed = false;
  win.setIgnoreMouseEvents(true);
  if (watchdog) clearTimeout(watchdog);
  watchdog = setTimeout(revealMainWindow, WATCHDOG_MS);
  win.webContents.on('render-process-gone', revealMainWindow);
};

export { armReveal, revealMainWindow, REVEAL_MS };
