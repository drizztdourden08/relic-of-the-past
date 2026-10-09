/* @layer electron-main @kind logic */
import type { SyncedRateStatus } from '@shared/types/display';
import { getDisplayModeDriver } from '../native';
import { modeSwitchState } from './mode-switch-state';
import { readStatus } from './read-status';
import { syncedRateMap } from './synced-rate-map';

const applyPermanently = (hz: number): SyncedRateStatus => {
  const driver = getDisplayModeDriver();
  modeSwitchState.lastError = '';
  if (!driver.available) {
    modeSwitchState.lastError = driver.unavailableReason;
    return readStatus();
  }
  const exactRate = syncedRateMap().get(hz);
  if (exactRate === undefined) {
    modeSwitchState.lastError = `this display does not offer ${hz} Hz`;
    return readStatus();
  }
  if (!driver.setRate(exactRate)) {
    modeSwitchState.lastError = `the system refused to switch this display to ${hz} Hz`;
    return readStatus();
  }
  modeSwitchState.rateToRestore = null;
  return readStatus();
};

export { applyPermanently };
