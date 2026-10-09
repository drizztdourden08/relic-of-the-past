/* @layer electron-main @kind logic */
import { closeSplash } from './close-splash';
import { fadeWindow } from './fade-window';
import { REVEAL_MS } from './reveal.constants';
import { revealState } from './reveal-state';

const revealMainWindow = (): void => {
  if (revealState.revealed) return;
  revealState.revealed = true;

  const win = revealState.target;
  revealState.target = null;
  if (revealState.watchdog) clearTimeout(revealState.watchdog);
  revealState.watchdog = null;

  closeSplash(REVEAL_MS);
  if (!win || win.isDestroyed()) return;

  win.setIgnoreMouseEvents(false);
  fadeWindow(win, 1, REVEAL_MS, () => {
    if (!win.isDestroyed()) win.focus();
  });
};

export { revealMainWindow };
