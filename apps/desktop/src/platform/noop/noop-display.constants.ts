/* @layer renderer-other @kind constants */
import type { DisplayPort } from '@shared/platform';
import { UNSUPPORTED_SYNCED_RATE } from '@shared/platform';

const NOOP_DISPLAY: DisplayPort = {
  getRefreshRate: async () => ({ reportedHz: null, measuredHz: null, modes: [] }),
  getSyncedRateStatus: async () => UNSUPPORTED_SYNCED_RATE,
  setSyncedRatePreference: async () => UNSUPPORTED_SYNCED_RATE,
  applyRefreshRate: async () => UNSUPPORTED_SYNCED_RATE,
};

export { NOOP_DISPLAY };
