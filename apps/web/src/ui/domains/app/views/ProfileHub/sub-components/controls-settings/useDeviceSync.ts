/* @layer renderer-components @kind hook */
/**
 * useDeviceSync — detect and track connected input devices.
 *
 * `devices`/`filteredDevices` stay sourced from InputManager unchanged —
 * drag/drop preset assignment, haptics, and the display-mappings lookup all
 * key off that shape. `controllerGroups` is the newer, additional SDL3
 * device-list surface the device column now renders gamepads from (ready/
 * unavailable status, adapter grouping, capabilities), sourced separately
 * so none of those other consumers had to change.
 */

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
  const { groups: controllerGroups, isRescanPending, handleRescan, addMapping } = useControllerDevices();

  return { devices, filteredDevices, controllerGroups, isRescanPending, handleRescan, addMapping };
};

export { useDeviceSync };
