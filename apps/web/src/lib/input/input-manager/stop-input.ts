/* @layer renderer-lib @kind logic */
import type { InputManager } from './input-manager';

const unsubscribeControllers = (m: InputManager): void => {
  m.hidUnsubscribe?.(); m.hidUnsubscribe = null;
  m.hidDisconnectUnsub?.(); m.hidDisconnectUnsub = null;
  m.ipcControllerStateUnsub?.(); m.ipcControllerStateUnsub = null;
  m.controllerRemovedUnsub?.(); m.controllerRemovedUnsub = null;
  m.controllerRawUnsub?.(); m.controllerRawUnsub = null;
  m.controllerNameCacheUnsub?.(); m.controllerNameCacheUnsub = null;
  m.controllerFamilyCacheUnsub?.(); m.controllerFamilyCacheUnsub = null;
};

const stopInput = (m: InputManager): void => {
  m.running = false;
  window.removeEventListener('keydown', m.onKeyDown);
  window.removeEventListener('keyup', m.onKeyUp);
  document.documentElement.removeEventListener('keydown', m.guardEmscriptenKeys);
  document.documentElement.removeEventListener('keypress', m.guardEmscriptenKeys);

  unsubscribeControllers(m);

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

export { stopInput };
