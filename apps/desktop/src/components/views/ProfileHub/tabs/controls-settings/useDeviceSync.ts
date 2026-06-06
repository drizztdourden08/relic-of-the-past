/**
 * useDeviceSync — detect and track connected input devices.
 */

import { useState, useEffect } from 'react';
import type { DetectedDevice } from '@shared/types/controls';
import { getInputManager } from '../../../../../lib/input/input-manager';

const useDeviceSync = () => {
  const [devices, setDevices] = useState<DetectedDevice[]>([]);

  useEffect(() => {
    const inputMgr = getInputManager();
    setDevices(inputMgr.getDevices());
    const unsub = inputMgr.onDeviceChange((newDevices) => {
      setDevices(newDevices);
    });
    return unsub;
  }, []);

  const filteredDevices = devices.filter(d => !d.displayName.toLowerCase().includes('mouse'));

  return { devices, filteredDevices };
};

export { useDeviceSync };
