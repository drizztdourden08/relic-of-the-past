/* @layer renderer-components @kind hook */
import { useState, useEffect } from 'react';
import type { DetectedDevice } from '@shared/types/controls';
import { getInputManager } from '../../../../../../../lib/input/input-manager';
import { useControllerDevices } from '../../../../../../../lib/input/useControllerDevices';

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
  const { entries, groups: controllerGroups, isRescanPending, handleRescan, addMapping } = useControllerDevices();

  return { devices, filteredDevices, entries, controllerGroups, isRescanPending, handleRescan, addMapping };
};

export { useDeviceSync };
