/* @layer electron-main @kind logic */
import { bestSyncedRate } from '@shared/display/refresh-rate';
import type { SyncedRateStatus } from '@shared/types/display';
import { getDisplayModeDriver } from '../native';
import { availableSyncedRates } from './available-synced-rates';
import { modeSwitchState } from './mode-switch-state';
import { resolveTarget } from './resolve-target';

const readStatus = (): SyncedRateStatus => {
  const driver = getDisplayModeDriver();
  return {
    supported: driver.available,
    unsupportedReason: driver.unavailableReason,
    availableRates: driver.available ? availableSyncedRates() : [],
    currentHz: driver.currentRate(),
    activeHz: modeSwitchState.rateToRestore !== null ? resolveTarget() : null,
    bestHz: bestSyncedRate(driver.currentRate()),
    lastError: modeSwitchState.lastError,
  };
};

export { readStatus };
