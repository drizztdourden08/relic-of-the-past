/* @layer electron-main @kind logic */
/**
 * Refresh rate of the display the game window is actually on.
 *
 * `screen.getPrimaryDisplay()` is the wrong question on a multi-monitor desk: the window may
 * well be on the second screen, whose rate is what the game is being presented at.
 *
 * Electron reports the CURRENT rate only. There is no mode list and no variable-refresh
 * information anywhere on its Display object, so `modes` stays empty here and the renderer
 * falls back to deriving candidate rates arithmetically.
 */
import { screen } from 'electron';
import { getMainWindow } from '../window';
import type { RefreshRateInfo } from '@shared/types/display';

const readRefreshRate = (): RefreshRateInfo => {
  try {
    const win = getMainWindow();
    const display = win
      ? screen.getDisplayMatching(win.getBounds())
      : screen.getPrimaryDisplay();
    // 0 means "the platform declined to report one" rather than a real 0 Hz.
    const hz = display.displayFrequency;
    return { reportedHz: hz > 0 ? hz : null, measuredHz: null, modes: [] };
  } catch {
    // No display server (headless CI) — the renderer's own measurement still works.
    return { reportedHz: null, measuredHz: null, modes: [] };
  }
};

export { readRefreshRate };
