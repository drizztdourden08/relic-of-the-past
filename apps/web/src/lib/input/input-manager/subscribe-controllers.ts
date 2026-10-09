/* @layer renderer-lib @kind logic */
import * as controllersStore from '../controllers-store';
import { onControllerRaw } from '../native-capture-store';
import { startControllerNameCache } from '../controller-name-cache';
import { startControllerFamilyCache } from '../controller-family-cache';
import { controllerInputStore } from '../controller-input-store';
import type { ControllerInputState } from '../controller-input-store';
import type { InputManager } from './input-manager';
import { connectedGamepadKeys } from './connected-gamepad-keys';

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
  m.ipcControllerStateUnsub = controllersStore.onControllerState((deviceKey, buttons, axes) => {
    controllerInputStore.handleControllerState(deviceKey, buttons, axes);
  });
  m.controllerRemovedUnsub = window.api.onControllerRemoved((deviceKey) => {
    controllerInputStore.handleControllerRemoved(deviceKey);
  });
  m.controllerRawUnsub = onControllerRaw((report) => {
    controllerInputStore.handleRawReport(report);
  });
  m.controllerNameCacheUnsub = startControllerNameCache();
  m.controllerFamilyCacheUnsub = startControllerFamilyCache();
};

export { subscribeControllers };
