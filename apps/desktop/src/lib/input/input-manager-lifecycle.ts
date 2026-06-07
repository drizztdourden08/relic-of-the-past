/* @layer renderer-lib @kind logic */
/** Start/stop listener wiring + device refresh for InputManager (take the instance). */
import { KEYBOARD_DEFAULT } from '@shared/input';
import { detectAllDevices } from './device-detector';
import { webHidReader } from './hid-reader';
import type { WebHidInputState, DeviceStickCalibration } from './hid-reader';
import { profileFromPreset } from './profile-utils';
import { initController, resetController } from './controller-lifecycle';
import { resolveGamepad } from './input-manager-events';
import type { InputManager } from './input-manager';

const startInput = (m: InputManager): void => {
  if (m.running) return;
  m.running = true;

  if (!m.activeProfile) {
    m.setProfile(profileFromPreset(KEYBOARD_DEFAULT));
  }

  if (!m.calibrationLoaded) {
    m.calibrationLoaded = true;
    window.api.readStickCalibration()
      .then((store) => {
        webHidReader.loadStickCalibrations(store as Record<string, DeviceStickCalibration>);
      })
      .catch(() => {});
    window.api.readTriggerCalibration()
      .then((store) => {
        webHidReader.loadTriggerCalibrations(store);
      })
      .catch(() => {});
  }

  window.addEventListener('keydown', m.onKeyDown);
  window.addEventListener('keyup', m.onKeyUp);
  window.addEventListener('gamepadconnected', m.onGamepadConnected);
  window.addEventListener('gamepaddisconnected', m.onGamepadDisconnected);
  document.documentElement.addEventListener('keydown', m.guardEmscriptenKeys);
  document.documentElement.addEventListener('keypress', m.guardEmscriptenKeys);

  m.hidUnsubscribe = webHidReader.onInput((state: WebHidInputState) => {
    m.hidStates.set(state.deviceKey, { buttons: state.buttons, axes: state.axes });
    m.currentHidStates.set(state.deviceKey, state);
    m.hidStatesDirty = true;
    m.pauseManager.autoResume();
  });
  m.hidDisconnectUnsub = webHidReader.onDisconnect((_deviceKey) => {
    m.hidStates.delete(_deviceKey);
    m.currentHidStates.delete(_deviceKey);
    m.hidStatesDirty = true;
    m.rawDispatcher.removeDevice(_deviceKey);
    m.refreshDevices();
    m.pauseManager.checkControllerDisconnect(m.activeProfile, m.devices);
  });

  m.ipcReportUnsub = window.api.onHidReport((deviceKey, vendorId, productId, data) => {
    webHidReader.handleIpcReport(deviceKey, vendorId, productId, data);
  });
  m.ipcDisconnectUnsub = window.api.onHidDisconnect((info) => {
    webHidReader.handleIpcDisconnect(info.deviceKey, info.error);
    m.activeControllers.delete(info.deviceKey);
  });
  m.ipcErrorUnsub = window.api.onHidError((info) => {
    webHidReader.addDiag(`⚠ HID error (${info.deviceKey}): ${info.error}`);
    resetController(info.deviceKey, m.activeControllers);
  });
  m.ipcMainPerfUnsub = window.api.onHidMainPerf((msg) => {
    webHidReader.addDiag(`🖥 ${msg}`);
  });
  m.ipcDeviceOpenedUnsub = window.api.onHidDeviceOpened((info) => {
    webHidReader.markDeviceOpened(info.deviceKey, info.product);
    initController(info.deviceKey, info.vendorId, info.productId, m.activeControllers);
  });

  window.api.getOpenHidKeys().then(keys => {
    for (const key of keys) {
      webHidReader.markDeviceOpened(key);
    }
  }).catch(() => {});

  m.refreshDevices();
  m.devicePollId = setInterval(() => m.refreshDevices(), 2000);
  m.pollLoop();
};

const stopInput = (m: InputManager): void => {
  m.running = false;
  window.removeEventListener('keydown', m.onKeyDown);
  window.removeEventListener('keyup', m.onKeyUp);
  window.removeEventListener('gamepadconnected', m.onGamepadConnected);
  window.removeEventListener('gamepaddisconnected', m.onGamepadDisconnected);
  document.documentElement.removeEventListener('keydown', m.guardEmscriptenKeys);
  document.documentElement.removeEventListener('keypress', m.guardEmscriptenKeys);

  m.hidUnsubscribe?.(); m.hidUnsubscribe = null;
  m.hidDisconnectUnsub?.(); m.hidDisconnectUnsub = null;
  m.ipcReportUnsub?.(); m.ipcReportUnsub = null;
  m.ipcDisconnectUnsub?.(); m.ipcDisconnectUnsub = null;
  m.ipcErrorUnsub?.(); m.ipcErrorUnsub = null;
  m.ipcMainPerfUnsub?.(); m.ipcMainPerfUnsub = null;
  m.ipcDeviceOpenedUnsub?.(); m.ipcDeviceOpenedUnsub = null;

  m.hidStates.clear();
  m.currentHidStates.clear();
  m.currentGamepads = [];
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
  for (const dev of m.devices) {
    if (dev.inputApi === 'hid' && dev.vendorId && dev.productId) {
      const key = `${dev.vendorId}:${dev.productId}`;
      dev.stale = webHidReader.isDeviceStale(key);
    }
  }
  for (const fn of m.deviceListeners) {
    try { fn(m.devices); } catch { /* ignore */ }
  }

  window.api.enumerateHidDevices()
    .then(hidDevices => {
      m.hidDeviceCache = hidDevices;
      const updated = detectAllDevices(hidDevices);
      for (const dev of updated) {
        if (dev.inputApi === 'hid' && dev.vendorId && dev.productId) {
          const key = `${dev.vendorId}:${dev.productId}`;
          dev.stale = webHidReader.isDeviceStale(key);
        }
      }
      if (JSON.stringify(updated) !== JSON.stringify(m.devices)) {
        m.devices = updated;
        for (const fn of m.deviceListeners) {
          try { fn(m.devices); } catch { /* ignore */ }
        }
      }
      const gamepads = navigator.getGamepads();
      for (const gp of gamepads) {
        if (gp && gp.connected && !m.gamepadVidPid.has(gp.index)) {
          resolveGamepad(m, gp);
        }
      }
    })
    .catch(() => {});
};

export { startInput, stopInput, refreshDevicesImpl };
