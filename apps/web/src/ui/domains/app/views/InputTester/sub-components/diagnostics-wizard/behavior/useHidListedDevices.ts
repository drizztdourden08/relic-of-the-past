/* @layer renderer-components @kind hook */
/** The raw HID enumeration for step 2 (see chooser-devices.ts), fetched
 *  once per wizard open. Unlike the SDL device snapshot this needs no
 *  subscription: enumerateHid has no push side, and is unaffected by the
 *  gamepad hold this wizard releases and restores around it. */
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
