/* @layer renderer-lib @kind logic */
import { controllerInputStore, inputApi } from '@drizztdourden08/brock-input/renderer';
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import type { ControllerInputState } from '@drizztdourden08/brock-input/renderer';
import type { InputManager } from './input-manager';
import { connectedGamepadKeys } from './connected-gamepad-keys';

const syncDeviceSnapshot = (m: InputManager, entries: DeviceEntry[]): void => {
  m.hidDeviceCache = entries;
  m.refreshDevices();
};

const subscribeControllers = (m: InputManager): void => {
  m.hidUnsubscribe = controllerInputStore.onInput((state: ControllerInputState) => {
    m.hidStates.set(state.deviceKey, { buttons: state.buttons, axes: state.axes });
    m.currentHidStates.set(state.deviceKey, state);
    m.hidStatesDirty = true;
    if (m.pauseManager.isPaused) m.resumeIfControllerPresent();
  });
  m.hidDisconnectUnsub = controllerInputStore.onDisconnect((deviceKey) => {
    m.hidStates.delete(deviceKey);
    m.currentHidStates.delete(deviceKey);
    m.hidStatesDirty = true;
    m.rawDispatcher.removeDevice(deviceKey);
    m.pauseManager.checkControllerDisconnect(m.activeProfile, connectedGamepadKeys(m), m.devices);
    m.refreshDevices();
  });
  const api = inputApi();
  m.controllerDevicesUnsub = api.onDevices((entries) => syncDeviceSnapshot(m, entries));
  api.list().then((entries) => syncDeviceSnapshot(m, entries)).catch(() => undefined);
};

export { subscribeControllers };
