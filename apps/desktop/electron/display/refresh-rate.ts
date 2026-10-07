/* @layer electron-main @kind logic */
/**
 * Refresh rate of the display the game window is on, not the primary display.
 *
 * Electron reports the CURRENT rate only, no mode list. The mode list comes from the
 * native driver where available and is empty otherwise, in which case the renderer
 * derives candidate rates arithmetically.
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
    // 0 means "the platform declined to report one", not a real 0 Hz.
    const hz = display.displayFrequency;
    // The driver already restricts itself to the current resolution, so every rate it lists
    // is one a switch could reach without also changing resolution.
    const driver = getDisplayModeDriver();
    const modes = driver.available
      ? driver.listRates().map((rate) => ({ hz: rate, sameResolution: true }))
      : [];
    return { reportedHz: hz > 0 ? hz : null, measuredHz: null, modes };
  } catch {
    // No display server, as in headless CI. The renderer measures the rate itself.
    return { reportedHz: null, measuredHz: null, modes: [] };
  }
};

export { readRefreshRate };
