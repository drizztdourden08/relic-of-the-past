/* @layer electron-main @kind logic */
import { fadeWindow } from './fade-window';
import { splashState } from './splash-state';

const closeSplash = (fadeMs: number): void => {
  const win = splashState.window;
  splashState.window = null;
  if (!win || win.isDestroyed()) return;
  fadeWindow(win, 0, fadeMs, () => {
    if (!win.isDestroyed()) win.destroy();
  });
};

export { closeSplash };
