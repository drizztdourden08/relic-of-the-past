/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { listHidDevices } from '@app/lib/input/controller-devices-store';
import type { HidListedDevice } from '@shared/ipc';

const useHidListedDevices = (active: boolean): HidListedDevice[] => {
  const [devices, setDevices] = useState<HidListedDevice[]>([]);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    listHidDevices().then((list) => { if (!cancelled) setDevices(list); }).catch(() => {});
    return () => { cancelled = true; };
  }, [active]);

  return devices;
};

export { useHidListedDevices };
