/* @layer electron-main @kind logic */
/**
 * Refresh rate of the display the game window is actually on.
 *
 * `screen.getPrimaryDisplay()` is the wrong question on a multi-monitor desk: the window may
 * well be on the second screen, whose rate is what the game is being presented at.
 *
 * Electron reports the CURRENT rate only — there is no mode list and no variable-refresh
 * information anywhere on its Display object. The mode list therefore comes from the native
 * driver where one is available, and is empty otherwise, in which case the renderer derives
 * candidate rates arithmetically instead.
 */
import { screen } from 'electron';
import { getMainWindow } from '../window';
import { getDisplayModeDriver } from './native';
import type { RefreshRateInfo } from '@shared/types/display';

const readRefreshRate = (): RefreshRateInfo => {
  try {
    const win = getMainWindow();
    const display = win
      ? screen.getDisplayMatching(win.getBounds())
      : screen.getPrimaryDisplay();
    // 0 means "the platform declined to report one" rather than a real 0 Hz.
    const hz = display.displayFrequency;
    // The driver already restricts itself to the current resolution, so every rate it lists
    // is one a switch could reach without also changing resolution.
    const driver = getDisplayModeDriver();
    const modes = driver.available
      ? driver.listRates().map((rate) => ({ hz: rate, sameResolution: true }))
      : [];
    return { reportedHz: hz > 0 ? hz : null, measuredHz: null, modes };
  } catch {
    // No display server (headless CI) — the renderer's own measurement still works.
    return { reportedHz: null, measuredHz: null, modes: [] };
  }
};

export { readRefreshRate };
