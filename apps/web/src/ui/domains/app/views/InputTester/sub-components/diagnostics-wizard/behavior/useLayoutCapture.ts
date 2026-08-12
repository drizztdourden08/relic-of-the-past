/* @layer renderer-components @kind hook */
/**
 * Reads one controller's real control layout, which means briefly bringing
 * SDL back up.
 *
 * Only a device SDL currently holds reports what buttons and axes it actually
 * has, plus its display name and per-button labels. The rest of this run needs
 * the subsystem down so it can read raw HID bytes, so the layout is fetched in
 * a short window of its own: restore the hold, wait for this device to be
 * claimed and report its capabilities, then release again. Whatever is read
 * here is frozen and used for the remainder of the run, since nothing can
 * answer these questions again until the very end.
 *
 * Reported as stages rather than a single boolean because the window is long
 * enough to see, and a spinner with no explanation looks like a hang.
 */
import { useCallback, useState } from 'react';
import { releaseHold, restoreHold } from '@app/lib/input/controller-hold-store';
import { listControllerDevices } from '@app/lib/input/controller-devices-store';
import { resolveDeviceFromEntry } from '@app/lib/input/resolve-device';
import type { ResolvedDevice } from '@shared/input/family';
import type { DeviceEntry } from '@shared/ipc';

type LayoutStage = 'idle' | 'starting' | 'fetching' | 'stopping' | 'done' | 'error';

interface CapturedLayout {
  deviceKey: string;
  entry: DeviceEntry;
  resolved: ResolvedDevice;
}

const POLL_MS = 120;
/** A claim plus its capability report lands well inside this; the cap only
 *  exists so a pad that never comes back cannot stall the wizard forever. */
const CLAIM_TIMEOUT_MS = 4000;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Waits for this device to come back claimed AND carrying its capabilities.
 *  Being listed is not enough: the entry appears before SDL has reported what
 *  the device can do, and reading it too early is what produced a control
 *  list padded out with positions the pad does not have. */
const awaitClaimedEntry = async (deviceKey: string): Promise<DeviceEntry | null> => {
  const deadline = Date.now() + CLAIM_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const entries = await listControllerDevices();
    const match = entries.find((d) => d.deviceKey === deviceKey && d.status === 'ready' && d.hasButton?.length);
    if (match) return match;
    await sleep(POLL_MS);
  }
  return null;
};

const useLayoutCapture = () => {
  const [stage, setStage] = useState<LayoutStage>('idle');
  const [layout, setLayout] = useState<CapturedLayout | null>(null);

  const capture = useCallback(async (deviceKey: string): Promise<CapturedLayout | null> => {
    setStage('starting');
    try {
      await restoreHold();
      setStage('fetching');
      const entry = await awaitClaimedEntry(deviceKey);
      setStage('stopping');
      await releaseHold();
      if (!entry) { setStage('error'); return null; }
      const captured: CapturedLayout = { deviceKey, entry, resolved: resolveDeviceFromEntry(entry) };
      setLayout(captured);
      setStage('done');
      return captured;
    } catch {
      // The hold must not be left up: the next step reads raw bytes and cannot
      // while SDL holds the device.
      await releaseHold().catch(() => { /* nothing further to try */ });
      setStage('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => { setStage('idle'); setLayout(null); }, []);

  return { stage, layout, capture, reset };
};

export { useLayoutCapture };
export type { CapturedLayout, LayoutStage };
