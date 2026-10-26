/* @layer renderer-lib @kind logic */
import { detectAllDevices, rebuildSchemeBindings, notifyQuietly } from '@rotp/input-mapping';
import type { InputManager } from './input-manager';

const refreshInputDevices = (m: InputManager): void => {
  m.devices = detectAllDevices(m.hidDeviceCache);
  notifyQuietly(m.deviceListeners, m.devices);
  rebuildSchemeBindings(m.activeProfile, m.hidDeviceCache);
};

export { refreshInputDevices };
