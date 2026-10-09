/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { normalBoundsCache } from './normal-bounds-cache';
import { getStatePath } from './state-path';
import type { WindowState } from './window-state.type';

const saveWindowState = (win: BrowserWindow): void => {
  const isMaximized = win.isMaximized();
  const isFullscreen = win.isFullScreen();

  const bounds = normalBoundsCache.bounds ?? win.getContentBounds();

  const state: WindowState = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    isMaximized,
    isFullscreen,
  };

  try {
    const filePath = getStatePath();
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('[window-state] Failed to save:', err);
  }
};

export { saveWindowState };
