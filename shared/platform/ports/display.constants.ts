/* @layer shared-platform @kind constants */
import type { SyncedRateStatus } from '../../types/display';

const UNSUPPORTED_SYNCED_RATE: SyncedRateStatus = {
  supported: false,
  unsupportedReason: 'changing the refresh rate is only possible in the desktop app',
  availableRates: [],
  currentHz: null,
  activeHz: null,
  bestHz: null,
  lastError: '',
};

export { UNSUPPORTED_SYNCED_RATE };
