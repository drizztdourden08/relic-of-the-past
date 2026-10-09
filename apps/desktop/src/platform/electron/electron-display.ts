/* @layer renderer-other @kind logic */
import type { DisplayPort } from '@shared/platform';
import { appApi } from '@app/ipc/app-api';

const createElectronDisplay = (): DisplayPort => ({
  getRefreshRate: () => appApi().getRefreshRate(),
  getSyncedRateStatus: () => appApi().getSyncedRateStatus(),
  setSyncedRatePreference: (enabled, targetHz) => appApi().setSyncedRatePreference(enabled, targetHz),
  applyRefreshRate: (hz) => appApi().applyRefreshRate(hz),
});

export { createElectronDisplay };
