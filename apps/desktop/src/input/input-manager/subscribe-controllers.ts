/* @layer renderer-lib @kind logic */
import { inputApi } from '@drizztdourden08/brock-input/renderer';
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import { startControllerNameCache } from '@app/input/controller-name-cache/start-controller-name-cache';
import { startControllerFamilyCache } from '@app/input/controller-family-cache/start-controller-family-cache';
import { controllerInputStore } from '../controller-input-store';
import type { ControllerInputState } from '../controller-input-store';
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
  m.ipcControllerStateUnsub = api.onState((deviceKey, buttons, axes) => {
    controllerInputStore.handleControllerState(deviceKey, buttons, axes);
  });
  m.controllerRemovedUnsub = api.onRemoved((deviceKey) => {
    controllerInputStore.handleControllerRemoved(deviceKey);
  });
  m.controllerRawUnsub = api.capture.onRaw((report) => {
    controllerInputStore.handleRawReport(report);
  });
  m.controllerNameCacheUnsub = startControllerNameCache();
  m.controllerFamilyCacheUnsub = startControllerFamilyCache();
  m.controllerDevicesUnsub = api.onDevices((entries) => syncDeviceSnapshot(m, entries));
  api.list().then((entries) => syncDeviceSnapshot(m, entries)).catch(() => undefined);
};

export { subscribeControllers };
