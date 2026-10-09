/* @layer renderer-lib @kind logic */
import { KEYBOARD_DEFAULT } from '@rotp/input-mapping';
import { profileFromPreset } from '@rotp/input-mapping';
import type { InputManager } from './input-manager';
import { DEVICE_POLL_MS } from '@rotp/input-mapping';
import { loadCalibrations } from './load-calibrations';
import { subscribeControllers } from './subscribe-controllers';

const startInput = (m: InputManager): void => {
  if (m.running) return;
  m.running = true;

  if (!m.activeProfile) {
    m.setProfile(profileFromPreset(KEYBOARD_DEFAULT));
  }

  if (!m.calibrationLoaded) {
    m.calibrationLoaded = true;
    loadCalibrations();
  }

  window.addEventListener('keydown', m.onKeyDown);
  window.addEventListener('keyup', m.onKeyUp);
  document.documentElement.addEventListener('keydown', m.guardEmscriptenKeys);
  document.documentElement.addEventListener('keypress', m.guardEmscriptenKeys);

  subscribeControllers(m);

  m.refreshDevices();
  m.devicePollId = setInterval(() => {
    m.refreshDevices();
    if (m.pauseManager.isPaused) m.resumeIfControllerPresent();
  }, DEVICE_POLL_MS);
  m.pollLoop();
};

export { startInput };
