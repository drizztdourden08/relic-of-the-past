/* @layer renderer-components @kind hook */
/**
 * Step 1's async status line: captures the SDL-claimed device snapshot
 * BEFORE releasing the hold, then releases it. The capture has to happen
 * first and finish first: SDL closes every gamepad through the normal
 * "removed" path as part of releasing, so waiting until after the release
 * would see nothing SDL-claimed at all. See chooser-devices.ts for why step
 * 2 needs this frozen snapshot, not a live one.
 *
 * The snapshot is settled, not read once. Devices are claimed one at a
 * time and each arrives on its own event, so a single read catches whatever
 * happens to be ready at that instant. That cost a controller its gyro flag
 * (only present on a claimed entry) and, on a restart right after the hold
 * came back, left a still-reconnecting pad out of the list entirely.
 */
import { useEffect, useState } from 'react';
import { releaseHold } from '@app/lib/input/controller-hold-store';
import { listControllerDevices } from '@app/lib/input/controller-devices-store';
import type { DeviceEntry } from '@shared/ipc';
import type { HoldTransitionStatus } from './useHoldTransition';

const POLL_MS = 150;
/** Long enough for a set of controllers to finish being claimed, short enough
 *  that the intro step does not feel stalled when only one is attached. */
const SETTLE_MS = 1500;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Reads the claimed list until it stops growing, or the budget runs out. */
const settledReadyDevices = async (isCancelled: () => boolean): Promise<DeviceEntry[]> => {
  const deadline = Date.now() + SETTLE_MS;
  let best: DeviceEntry[] = [];
  let stableFor = 0;

  while (Date.now() < deadline && !isCancelled()) {
    const ready = (await listControllerDevices()).filter((d) => d.status === 'ready');
    if (ready.length > best.length) {
      best = ready;
      stableFor = 0;
    } else {
      stableFor += POLL_MS;
      // Two quiet polls in a row means the set has stopped filling.
      if (best.length > 0 && stableFor >= POLL_MS * 2) return best;
    }
    await sleep(POLL_MS);
  }
  return best;
};

/** `runGeneration`: bump this to force the capture+release to run again
 *  while `active` stays continuously true, e.g. the summary step's "Restart
 *  on another controller" restarting the whole flow without the dialog
 *  itself closing and reopening. */
const useStep1Shutdown = (active: boolean, runGeneration = 0) => {
  const [preReleaseReady, setPreReleaseReady] = useState<DeviceEntry[]>([]);
  const [releaseStatus, setReleaseStatus] = useState<HoldTransitionStatus>('pending');

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const isCancelled = () => cancelled;
    setReleaseStatus('pending');

    const run = async () => {
      try {
        const ready = await settledReadyDevices(isCancelled);
        if (cancelled) return;
        setPreReleaseReady(ready);
        const ok = await releaseHold();
        if (!cancelled) setReleaseStatus(ok ? 'done' : 'error');
      } catch {
        if (!cancelled) setReleaseStatus('error');
      }
    };
    void run();

    return () => { cancelled = true; };
  }, [active, runGeneration]);

  return { preReleaseReady, releaseStatus };
};

export { useStep1Shutdown };
