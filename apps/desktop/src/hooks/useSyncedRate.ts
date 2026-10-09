/* @layer renderer-other @kind hook */
import { displayPort } from '@app/platform/display-port';
import { useState, useEffect, useCallback } from 'react';
import type { SyncedRateStatus } from '@shared/types/display';
import { UNSUPPORTED_SYNCED_RATE } from '@shared/platform';
import type { SyncedRateControl } from './use-synced-rate.type';

const useSyncedRate = (enabled: boolean, targetHz: number): SyncedRateControl => {
  const [status, setStatus] = useState<SyncedRateStatus>(UNSUPPORTED_SYNCED_RATE);

  const push = useCallback((nextEnabled: boolean, nextTargetHz: number) => {
    displayPort().setSyncedRatePreference(nextEnabled, nextTargetHz)
      .then(setStatus)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    push(enabled, targetHz);
  }, [push, enabled, targetHz]);

  return { status, push };
};

export { useSyncedRate };
export type { SyncedRateControl };
