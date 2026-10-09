/* @layer renderer-lib @kind logic */
import { listControllerDevices } from '../controller-devices-store';
import { detectAllDevices } from '../device-detector';
import { rebuildSchemeBindings } from '../scheme-runtime';
import type { InputManager } from './input-manager';
import { notifyQuietly } from './notify-quietly';

const refreshInputDevices = (m: InputManager): void => {
  m.devices = detectAllDevices(m.hidDeviceCache);
  notifyQuietly(m.deviceListeners, m.devices);

  listControllerDevices()
    .then(deviceEntries => {
      m.hidDeviceCache = deviceEntries;
      rebuildSchemeBindings(m.activeProfile, deviceEntries);
      const updated = detectAllDevices(deviceEntries);
      if (JSON.stringify(updated) !== JSON.stringify(m.devices)) {
        m.devices = updated;
        notifyQuietly(m.deviceListeners, m.devices);
      }
    })
    .catch(() => undefined);
};

export { refreshInputDevices };
