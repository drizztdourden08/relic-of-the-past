/* @layer electron-main @kind logic */
/**
 * Hold an automation window behind whatever the person at the keyboard is doing,
 * for the whole life of the window, not just at launch.
 *
 * Plenty of things raise a window LATER: Playwright's click path calls
 * Page.bringToFront() before every `locator.click()`, DevTools activates its
 * owner, the OS raises windows for its own reasons. Enumerating those has
 * repeatedly missed one, so *gaining focus at all* is treated as the fault and
 * undone immediately. Input still works: CDP does not need OS focus.
 */
import type { BrowserWindow } from 'electron';
import { sendWindowToBack } from './send-to-back';

/** A single raise can fire several events; coalesce so we spawn one helper, not five. */
const BOUNCE_DEBOUNCE_MS = 50;

const keepWindowInBackground = (win: BrowserWindow): void => {
  let timer: NodeJS.Timeout | null = null;

  const bounce = (): void => {
    if (win.isDestroyed()) return;
    // ONLY blur when we hold focus. An unconditional blur() takes focus off this
    // window without handing it back, so the foreground falls through to the
    // desktop ("Program Manager"), measured doing exactly that.
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
