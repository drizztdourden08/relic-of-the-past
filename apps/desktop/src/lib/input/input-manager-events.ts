/* @layer renderer-lib @kind logic */
/** Event handlers, map rebuild, and the per-frame poll loop for InputManager (take the instance). */
import { markActivated, updateActivationState } from './device-detector';
import { resolveGamepadVidPid } from './gamepad-vid-pid';
import { computeBitmask, snapshotGamepads } from './polling-engine';
import type { InputManager } from './input-manager';

const isTextInput = (target: EventTarget | null): boolean => {
  if (!target) return false;
  const tag = (target as HTMLElement).tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' ||
         (target as HTMLElement).isContentEditable;
};

const rebuildMaps = (m: InputManager): void => {
  m.keyboardMap.clear();
  m.gamepadButtonMap.clear();
  m.gamepadAxisMap.clear();
  if (!m.activeProfile) return;
  for (const mapping of m.activeProfile.mappings) {
    const b = mapping.binding;
    switch (b.type) {
      case 'keyboard':
        m.keyboardMap.set(b.code, mapping.snesButton);
        break;
      case 'gamepad-button':
        m.gamepadButtonMap.set(b.index, mapping.snesButton);
        break;
      case 'gamepad-axis':
        m.gamepadAxisMap.set(`${b.axisIndex}:${b.direction}`, mapping.snesButton);
        break;
    }
  }
};

const guardKeys = (m: InputManager, e: KeyboardEvent): void => {
  // Never block Escape — it's handled by the app-level menu toggle
  if (e.code === 'Escape') return;
  if (isTextInput(e.target) || m.inputSuppressed) {
    e.stopPropagation();
  }
};

const keyDown = (m: InputManager, e: KeyboardEvent): void => {
  if (isTextInput(e.target)) return;
  // Escape is reserved for app-level menu toggle — never process as game/function input
  if (e.code === 'Escape') return;
  m.allPressedKeys.add(e.code);
  m.rawDispatcher.emit({ type: 'keyboard', code: e.code }, 'keyboard');

  if (m.inputSuppressed) return;

  if (!e.repeat) {
    if (m.functionActions.handleKeyDown(e.code, e.shiftKey, e.ctrlKey, e.altKey)) {
      e.preventDefault();
      return;
    }
  }

  if (m.keyboardMap.has(e.code)) {
    e.preventDefault();
    m.keyStates.set(e.code, true);
  }
};

const keyUp = (m: InputManager, e: KeyboardEvent): void => {
  m.allPressedKeys.delete(e.code);
  if (m.keyboardMap.has(e.code)) {
    m.keyStates.set(e.code, false);
  }
  if (!m.inputSuppressed) {
    m.functionActions.handleKeyUp(e.code);
  }
};

const resolveGamepad = (m: InputManager, gp: Gamepad): void => {
  const alreadyMapped = new Set([...m.gamepadVidPid.values()].map(v => `${v.vid}:${v.pid}`));
  const result = resolveGamepadVidPid(gp, m.hidDeviceCache, alreadyMapped);
  if (result) {
    m.gamepadVidPid.set(gp.index, result);
  }
};

const gamepadConnected = (m: InputManager, e: GamepadEvent): void => {
  markActivated(e.gamepad.index);
  updateActivationState();
  resolveGamepad(m, e.gamepad);
  m.refreshDevices();
  m.pauseManager.autoResume();
};

const gamepadDisconnected = (m: InputManager): void => {
  updateActivationState();
  m.refreshDevices();
  m.pauseManager.checkControllerDisconnect(m.activeProfile, m.devices);
};

const pollFrame = (m: InputManager): void => {
  if (!m.running) return;

  const windowFocused = document.hasFocus();

  m.currentGamepads = snapshotGamepads();

  if (windowFocused && !m.pauseManager.isPaused && !m.inputSuppressed) {
    const mask = computeBitmask(m.keyStates, m.keyboardMap, m.gamepadButtonMap, m.gamepadAxisMap, m.hidStates);
    m.setInputFn?.(mask);
  }

  if (windowFocused && m.rawDispatcher.hasListeners) {
    m.rawDispatcher.emitGamepadEvents(m.gamepadVidPid);
    m.rawDispatcher.emitHidEvents(m.hidStates);
  }

  if (windowFocused && !m.inputSuppressed && m.functionActions.hasMappedGamepadButtons) {
    m.functionActions.checkGamepads(m.hidStates);
  }

  if (m.stateListeners.size > 0) {
    if (m.hidStatesDirty) {
      m.currentHidStates = new Map(m.currentHidStates);
      m.hidStatesDirty = false;
    }
    for (const fn of m.stateListeners) {
      try { fn(m.currentHidStates, m.currentGamepads, m.allPressedKeys); } catch { /* ignore */ }
    }
  }

  m.animFrameId = requestAnimationFrame(m.pollLoop);
};

export { isTextInput, rebuildMaps, guardKeys, keyDown, keyUp, resolveGamepad, gamepadConnected, gamepadDisconnected, pollFrame };
