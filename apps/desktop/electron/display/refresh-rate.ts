/* @layer electron-main @kind logic */
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
    const hz = display.displayFrequency;
    const driver = getDisplayModeDriver();
    const modes = driver.available
      ? driver.listRates().map((rate) => ({ hz: rate, sameResolution: true }))
      : [];
    const platformReportedRate = hz > 0;
    return { reportedHz: platformReportedRate ? hz : null, measuredHz: null, modes };
  } catch {
    return { reportedHz: null, measuredHz: null, modes: [] };
  }
};

export { readRefreshRate };
