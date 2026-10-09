/* @layer renderer-lib @kind logic */
import { inputApi } from '@drizztdourden08/brock-input/renderer';
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import { detectAllDevices } from '@rotp/input-mapping';
import { rebuildSchemeBindings } from '@rotp/input-mapping';
import type { InputManager } from './input-manager';
import { notifyQuietly } from '@rotp/input-mapping';

const refreshInputDevices = (m: InputManager): void => {
  m.devices = detectAllDevices(m.hidDeviceCache);
  notifyQuietly(m.deviceListeners, m.devices);

  (inputApi()?.list() ?? Promise.resolve<DeviceEntry[]>([]))
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
