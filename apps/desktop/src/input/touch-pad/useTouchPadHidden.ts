/* @layer renderer-lib @kind hook */
import { useEffect, useState } from 'react';
import { useSettings } from '@drizztdourden08/brock-react';
import { getInputManager } from '../input-manager/get-input-manager';
import type { AppSettings } from '@app/settings.type';

const physicalPadConnected = (): boolean =>
  getInputManager().getDevices().some((device) => device.type === 'gamepad' && device.connected);

/** True while the overlay is set to hide and a physical gamepad is connected. */
const useTouchPadHidden = (): boolean => {
  const { settings } = useSettings<AppSettings>();
  const [connected, setConnected] = useState(physicalPadConnected);

  useEffect(() => {
    const manager = getInputManager();
    const sync = (): void => setConnected(physicalPadConnected());
    sync();
    return manager.onDeviceChange(sync);
  }, []);

  return settings.touchControls.hideWithPad && connected;
};

export { useTouchPadHidden };
