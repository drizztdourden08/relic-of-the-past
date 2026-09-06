/* @layer renderer-other @kind hook */
/**
 * Synced-refresh-rate status, and the push of the preference down to the host.
 *
 * The host owns applying and restoring the rate, because that has to survive the window
 * closing or the app quitting straight out of fullscreen. This hook only reports what the host
 * can do and forwards the player's choice.
 */
import { useState, useEffect, useCallback } from 'react';
import type { SyncedRateStatus } from '@shared/types/display';
import { UNSUPPORTED_SYNCED_RATE } from '@shared/platform';
import { getPlatform } from '../platform/get-platform';

interface SyncedRateControl {
  status: SyncedRateStatus;
  /** Forward the preference and take back the host's updated view of it. */
  push: (enabled: boolean, targetHz: number) => void;
}

const useSyncedRate = (enabled: boolean, targetHz: number): SyncedRateControl => {
  const [status, setStatus] = useState<SyncedRateStatus>(UNSUPPORTED_SYNCED_RATE);

  const push = useCallback((nextEnabled: boolean, nextTargetHz: number) => {
    getPlatform().display.setSyncedRatePreference(nextEnabled, nextTargetHz)
      .then(setStatus)
      .catch(() => { /* host cannot do it; the status already says so */ });
  }, []);

  // Re-push whenever the stored preference changes, so the host's copy never drifts from the
  // profile. That includes the first mount, which is what arms it for the session.
  useEffect(() => {
    push(enabled, targetHz);
  }, [push, enabled, targetHz]);

  return { status, push };
};

export { useSyncedRate };
export type { SyncedRateControl };
