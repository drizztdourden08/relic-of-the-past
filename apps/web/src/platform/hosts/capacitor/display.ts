/* @layer renderer-other @kind logic */
/**
 * Capacitor display adapter.
 *
 * Android reports its supported rates and lets an app state the rate it intends to present at,
 * which the platform then uses to pick a display mode. That request is made once here, at
 * startup, rather than exposed as a setting: unlike desktop there is no mode for the user to
 * choose between, and the platform may decline regardless.
 */
import { UNSUPPORTED_SYNCED_RATE } from '@shared/platform';
import type { DisplayPort } from '@shared/platform';
import type { RefreshRateInfo } from '@shared/types/display';
import { FrameRatePlugin, parseSupportedHz } from './frame-rate-plugin';

/** Asked for once per session; repeating it on every status read would be pointless churn. */
let requested = false;

const requestGameFrameRate = async (): Promise<void> => {
  if (requested) return;
  requested = true;
  try {
    await FrameRatePlugin.setGameFrameRate();
  } catch {
    // Older build without the plugin, or the platform declined. The measured rate still
    // drives the advisory, so there is nothing to recover from here.
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
      // Android switches modes itself, so every reported rate is reachable at this resolution.
      modes: rates.map((hz) => ({ hz, sameResolution: true })),
    };
  } catch {
    return { reportedHz: null, measuredHz: null, modes: [] };
  }
};

const createCapacitorDisplay = (): DisplayPort => ({
  getRefreshRate: readRefreshRate,
  // No user-facing switch on Android: the platform owns mode selection and only takes a hint.
  getSyncedRateStatus: async () => UNSUPPORTED_SYNCED_RATE,
  setSyncedRatePreference: async () => UNSUPPORTED_SYNCED_RATE,
});

export { createCapacitorDisplay };
