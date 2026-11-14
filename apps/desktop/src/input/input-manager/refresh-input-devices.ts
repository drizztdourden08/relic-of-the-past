/* @layer renderer-lib @kind logic */
import { detectAllDevices, rebuildSchemeBindings, notifyQuietly } from '@rotp/input-mapping';
import { withTouchDevice } from '../touch-pad/with-touch-device';
import type { InputManager } from './input-manager';

const refreshInputDevices = (m: InputManager): void => {
  m.devices = detectAllDevices(m.hidDeviceCache);
  notifyQuietly(m.deviceListeners, m.devices);
  rebuildSchemeBindings(m.activeProfile, withTouchDevice(m.hidDeviceCache));
};

export { refreshInputDevices };
