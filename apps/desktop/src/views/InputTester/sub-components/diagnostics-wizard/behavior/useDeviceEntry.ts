/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { inputApi } from '@drizztdourden08/brock-input/renderer';
import type { DeviceEntry } from '@drizztdourden08/brock-input';

const useDeviceEntry = (deviceKey: string | null): DeviceEntry | null => {
  const [entry, setEntry] = useState<DeviceEntry | null>(null);

  useEffect(() => {
    const api = inputApi();
    if (!deviceKey) { setEntry(null); return; }
    let cancelled = false;
    const findMatch = (list: DeviceEntry[]) => list.find((d) => d.deviceKey === deviceKey) ?? null;

    api.list().then((list) => { if (!cancelled) setEntry(findMatch(list)); }).catch(() => {});
    const unsubscribe = api.onDevices((list) => { if (!cancelled) setEntry(findMatch(list)); });

    return () => { cancelled = true; unsubscribe(); };
  }, [deviceKey]);

  return entry;
};

export { useDeviceEntry };
