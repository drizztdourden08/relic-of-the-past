/* @layer electron-main @kind logic */
/**
 * Hold an automation window behind whatever the person at the keyboard is doing,
 * for the whole life of the window rather than just at launch.
 *
 * Launch-time handling (showInactive + blur + SetWindowPos(HWND_BOTTOM)) only
 * covers the moment the window opens. Plenty of things raise a window LATER, and
 * each one steals focus mid-session:
 *   - Playwright's click path calls Chromium's Page.bringToFront() before
 *     dispatching the mouse event, so every `locator.click()` re-activates us.
 *   - DevTools opening activates its owner window.
 *   - The OS raises windows for its own reasons (taskbar grouping, focus-follows
 *     policies, a child process finishing).
 *
 * Enumerating those causes has repeatedly missed one. So instead of predicting
 * them, treat *gaining focus at all* as the fault: in automation mode the window
 * has no business being focused, so when it is, undo it immediately. That covers
 * every current cause and any future one for free.
 *
 * Input still works — Playwright drives the renderer over CDP
 * (Input.dispatchMouseEvent / dispatchKeyEvent), which does not need OS focus.
 */
import type { BrowserWindow } from 'electron';
import { sendWindowToBack } from './send-to-back';

/** A single raise can fire several events; coalesce so we spawn one helper, not five. */
const BOUNCE_DEBOUNCE_MS = 50;

const keepWindowInBackground = (win: BrowserWindow): void => {
  let timer: NodeJS.Timeout | null = null;

  const bounce = (): void => {
    if (win.isDestroyed()) return;
    // ONLY blur when we actually hold focus. An unconditional blur() is actively
    // harmful: it takes focus off this window without handing it back to whoever
    // had it, so the foreground falls through to the desktop ("Program Manager")
    // — measured doing exactly that, which is itself the focus loss we are trying
    // to prevent. isFocused() keeps this to the one case where blurring helps.
    if (win.isFocused()) win.blur();
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!win.isDestroyed()) sendWindowToBack(win);
    }, BOUNCE_DEBOUNCE_MS);
  };

  win.on('focus', bounce);
  win.on('show', bounce);
  win.on('restore', bounce);
  // The first painted frame can bounce the window back up the z-order on Windows.
  win.once('ready-to-show', bounce);

  win.once('closed', () => {
    if (timer) clearTimeout(timer);
    timer = null;
  });
};

export { keepWindowInBackground };
