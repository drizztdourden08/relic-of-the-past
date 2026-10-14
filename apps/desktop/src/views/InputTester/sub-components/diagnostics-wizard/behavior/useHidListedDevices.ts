/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { inputApi } from '@drizztdourden08/brock-input/renderer';
import type { HidListedDevice } from '@drizztdourden08/brock-input';

const useHidListedDevices = (active: boolean): HidListedDevice[] => {
  const [devices, setDevices] = useState<HidListedDevice[]>([]);

  useEffect(() => {
    const api = inputApi();
    if (!active) return;
    let cancelled = false;
    api.listHid().then((list) => { if (!cancelled) setDevices(list); }).catch(() => {});
    return () => { cancelled = true; };
  }, [active]);

  return devices;
};

export { useHidListedDevices };
