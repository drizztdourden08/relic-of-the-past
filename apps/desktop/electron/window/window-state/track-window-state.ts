/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';
import { normalBoundsCache } from './normal-bounds-cache';

const trackWindowState = (win: BrowserWindow): void => {
  const updateNormalBounds = (): void => {
    if (!win.isMaximized() && !win.isFullScreen() && !win.isMinimized()) {
      normalBoundsCache.bounds = win.getContentBounds();
    }
  };

  win.on('move', updateNormalBounds);
  win.on('resize', updateNormalBounds);

  updateNormalBounds();
};

export { trackWindowState };
