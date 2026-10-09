/* @layer renderer-other @kind logic */
import { UNSUPPORTED_SYNCED_RATE } from '@shared/platform';
import type { DisplayPort } from '@shared/platform';
import type { RefreshRateInfo } from '@shared/types/display';
import { FrameRatePlugin, parseSupportedHz } from './frame-rate-plugin';

let requestedThisSession = false;

const requestGameFrameRate = async (): Promise<void> => {
  if (requestedThisSession) return;
  requestedThisSession = true;
  try {
    await FrameRatePlugin.setGameFrameRate();
  } catch {
    return;
  }
};

const readRefreshRate = async (): Promise<RefreshRateInfo> => {
  void requestGameFrameRate();
  try {
    const info = await FrameRatePlugin.getDisplayInfo();
    const rates = parseSupportedHz(info.supportedHz);
    return {
      reportedHz: info.currentHz > 0 ? info.currentHz : null,
      measuredHz: null,
      modes: rates.map((hz) => ({ hz, sameResolution: true })),
    };
  } catch {
    return { reportedHz: null, measuredHz: null, modes: [] };
  }
};

const createCapacitorDisplay = (): DisplayPort => ({
  getRefreshRate: readRefreshRate,
  getSyncedRateStatus: async () => UNSUPPORTED_SYNCED_RATE,
  setSyncedRatePreference: async () => UNSUPPORTED_SYNCED_RATE,
  applyRefreshRate: async () => UNSUPPORTED_SYNCED_RATE,
});

export { createCapacitorDisplay };
