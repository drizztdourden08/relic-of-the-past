/* @layer renderer-components @kind hook */
/**
 * Resolves the full DeviceEntry (sdlId, guid, capability flags) for a
 * deviceKey, kept in sync with the live SDL3 snapshot. Step 3 needs the sdlId
 * to open a joystick-level capture; the byte-level step gets by on deviceKey
 * alone, so it doesn't need this.
 */
import { useEffect, useState } from 'react';
import type { DeviceEntry } from '@shared/ipc';
import { listControllerDevices, onControllerDevicesSnapshot } from '@app/lib/input/controller-devices-store';

const useDeviceEntry = (deviceKey: string | null): DeviceEntry | null => {
  const [entry, setEntry] = useState<DeviceEntry | null>(null);

  useEffect(() => {
    if (!deviceKey) { setEntry(null); return; }
    let cancelled = false;
    const findMatch = (list: DeviceEntry[]) => list.find((d) => d.deviceKey === deviceKey) ?? null;

    listControllerDevices().then((list) => { if (!cancelled) setEntry(findMatch(list)); }).catch(() => {});
    const unsubscribe = onControllerDevicesSnapshot((list) => { if (!cancelled) setEntry(findMatch(list)); });

    return () => { cancelled = true; unsubscribe(); };
  }, [deviceKey]);

  return entry;
};

export { useDeviceEntry };
