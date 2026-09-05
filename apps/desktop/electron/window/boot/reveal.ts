/* @layer electron-main @kind logic */
/**
 * Boot mediator. This is the one place that knows both the splash and the main
 * window exist. The renderer's shell-ready signal lands here and drives the swap.
 * It is idempotent because the signal, a watchdog, and a dead renderer can all
 * trigger it, and a boot that goes wrong must still end with a visible window.
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
 * Opacity, not show:false: Chromium does not schedule requestAnimationFrame for a
 * hidden page, so React would mount into a stalled frame loop.
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
