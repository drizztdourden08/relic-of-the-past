/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';
import { sendWindowToBack } from './send-to-back';
import { BOUNCE_DEBOUNCE_MS } from './keep-in-background.constants';

const keepWindowInBackground = (win: BrowserWindow): void => {
  let timer: NodeJS.Timeout | null = null;

  const bounce = (): void => {
    if (win.isDestroyed()) return;
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
  win.once('ready-to-show', bounce);

  win.once('closed', () => {
    if (timer) clearTimeout(timer);
    timer = null;
  });
};

export { keepWindowInBackground };
