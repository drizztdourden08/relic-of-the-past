/* @layer renderer-lib @kind logic */
/** Start/stop listener wiring + device refresh for InputManager (take the instance). */
import { KEYBOARD_DEFAULT } from '@shared/input';
import * as controllersStore from './controllers-store';
import { listControllerDevices } from './controller-devices-store';
import { onControllerRaw } from './native-capture-store';
import { startControllerNameCache } from './controller-name-cache';
import { startControllerFamilyCache } from './controller-family-cache';
import { detectAllDevices } from './device-detector';
import { controllerInputStore } from './controller-input-store';
import type { ControllerInputState, DeviceStickCalibration } from './controller-input-store';
import { profileFromPreset } from './profile-utils';
import { connectedGamepadKeys } from './input-manager-events';
import type { InputManager } from './input-manager';

const startInput = (m: InputManager): void => {
  if (m.running) return;
  m.running = true;

  if (!m.activeProfile) {
    m.setProfile(profileFromPreset(KEYBOARD_DEFAULT));
  }

  if (!m.calibrationLoaded) {
    m.calibrationLoaded = true;
    controllersStore.readStickCalibration()
      .then((store) => {
        controllerInputStore.loadStickCalibrations(store as Record<string, DeviceStickCalibration>);
      })
      .catch((e: unknown) => console.warn('[input] failed to load stick calibration', e));
    controllersStore.readTriggerCalibration()
      .then((store) => {
        controllerInputStore.loadTriggerCalibrations(store);
      })
      .catch((e: unknown) => console.warn('[input] failed to load trigger calibration', e));
  }

  window.addEventListener('keydown', m.onKeyDown);
  window.addEventListener('keyup', m.onKeyUp);
  document.documentElement.addEventListener('keydown', m.guardEmscriptenKeys);
  document.documentElement.addEventListener('keypress', m.guardEmscriptenKeys);

  m.hidUnsubscribe = controllerInputStore.onInput((state: ControllerInputState) => {
    m.hidStates.set(state.deviceKey, { buttons: state.buttons, axes: state.axes });
    m.currentHidStates.set(state.deviceKey, state);
    m.hidStatesDirty = true;
    // A mapped pad sending data again means it's back, so resume (gated to the profile).
    if (m.pauseManager.isPaused) m.resumeIfControllerPresent();
  });
  m.hidDisconnectUnsub = controllerInputStore.onDisconnect((_deviceKey) => {
    m.hidStates.delete(_deviceKey);
    m.currentHidStates.delete(_deviceKey);
    m.hidStatesDirty = true;
    m.rawDispatcher.removeDevice(_deviceKey);
    m.pauseManager.checkControllerDisconnect(m.activeProfile, connectedGamepadKeys(m), m.devices);
    m.refreshDevices();
  });

  // SDL3 transport, already-decoded state that bypasses any report parser.
  m.ipcControllerStateUnsub = controllersStore.onControllerState((deviceKey, buttons, axes) => {
    controllerInputStore.handleControllerState(deviceKey, buttons, axes);
  });
  m.controllerRemovedUnsub = window.api.onControllerRemoved((deviceKey) => {
    controllerInputStore.handleControllerRemoved(deviceKey);
  });
  // Diagnostic raw HID bytes only flow while some UI (the calibration
  // wizard) has a raw capture open; harmless to stay subscribed otherwise.
  m.controllerRawUnsub = onControllerRaw((report) => {
    controllerInputStore.handleRawReport(report);
  });
  // Names are announced once, on connect. Recording them from here means a
  // screen opened later, or one that deliberately released the devices, can
  // still show what each controller is called.
  m.controllerNameCacheUnsub = startControllerNameCache();
  // Same reasoning for the SDL type: a saved binding's icon is resolved from
  // this cache long after the device announced itself, so recording has to
  // start here instead of waiting for whichever screen happens to import it.
  m.controllerFamilyCacheUnsub = startControllerFamilyCache();

  m.refreshDevices();
  m.devicePollId = setInterval(() => {
    m.refreshDevices();
    // Safety net for a reconnect that fired no event. Resume only, never re-pause,
    // so a manual resume of a still-absent controller stays resumed.
    if (m.pauseManager.isPaused) m.resumeIfControllerPresent();
  }, 2000);
  m.pollLoop();
};

const stopInput = (m: InputManager): void => {
  m.running = false;
  window.removeEventListener('keydown', m.onKeyDown);
  window.removeEventListener('keyup', m.onKeyUp);
  document.documentElement.removeEventListener('keydown', m.guardEmscriptenKeys);
  document.documentElement.removeEventListener('keypress', m.guardEmscriptenKeys);

  m.hidUnsubscribe?.(); m.hidUnsubscribe = null;
  m.hidDisconnectUnsub?.(); m.hidDisconnectUnsub = null;
  m.ipcControllerStateUnsub?.(); m.ipcControllerStateUnsub = null;
  m.controllerRemovedUnsub?.(); m.controllerRemovedUnsub = null;
  m.controllerRawUnsub?.(); m.controllerRawUnsub = null;
  m.controllerNameCacheUnsub?.(); m.controllerNameCacheUnsub = null;
  m.controllerFamilyCacheUnsub?.(); m.controllerFamilyCacheUnsub = null;

  m.hidStates.clear();
  m.currentHidStates.clear();
  m.allPressedKeys.clear();

  if (m.devicePollId !== null) {
    clearInterval(m.devicePollId);
    m.devicePollId = null;
  }
  if (m.animFrameId !== null) {
    cancelAnimationFrame(m.animFrameId);
    m.animFrameId = null;
  }

  m.keyStates.clear();
  m.setInputFn?.(0);
};

const refreshDevicesImpl = (m: InputManager): void => {
  m.devices = detectAllDevices(m.hidDeviceCache);
  for (const fn of m.deviceListeners) {
    try { fn(m.devices); } catch { /* ignore */ }
  }

  listControllerDevices()
    .then(deviceEntries => {
      m.hidDeviceCache = deviceEntries;
      const updated = detectAllDevices(deviceEntries);
      if (JSON.stringify(updated) !== JSON.stringify(m.devices)) {
        m.devices = updated;
        for (const fn of m.deviceListeners) {
          try { fn(m.devices); } catch { /* ignore */ }
        }
      }
    })
    .catch(() => {});
};

export { startInput, stopInput, refreshDevicesImpl };
