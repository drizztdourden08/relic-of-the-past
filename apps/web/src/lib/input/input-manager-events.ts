/* @layer renderer-lib @kind logic */
/** Event handlers, map rebuild, and the per-frame poll loop for InputManager (take the instance). */
import { computeBitmask } from './polling-engine';
import { allowedDevices } from './profile-devices';
import { deviceKeyFor, setScoped } from './device-scoped-map';
import { isAutomationLaunch } from '../instance';
import type { InputManager } from './input-manager';

/**
 * Is the window eligible to receive game input this frame?
 *
 * Normally this is `document.hasFocus()`, so the game does not swallow keystrokes
 * while the person is typing in another app. An automation launch is the one case
 * where that gate is wrong: its window is deliberately never shown (so the run
 * cannot disturb the user's own fullscreen session), which makes `hasFocus()`
 * permanently false — and then synthesized input silently goes nowhere, looking
 * exactly like a broken input path. There is no human at the keyboard to protect
 * during such a run, so the gate simply does not apply.
 */
const inputEligible = (): boolean => document.hasFocus() || isAutomationLaunch();

/**
 * Fresh set of connected pad "vid:pid" keys, from the device snapshot rather than
 * from reported input. SDL emits state on change only, so a mapped pad nobody has
 * touched yet would be invisible to an input-derived set and could wedge a
 * disconnect-pause open forever — the snapshot (hidDeviceCache) is seeded on
 * startup and kept live independently of any button press.
 */
const connectedGamepadKeys = (m: InputManager): Set<string> =>
  new Set(m.hidDeviceCache.filter((d) => d.status === 'ready').map((d) => d.deviceKey));

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
  m.allowed = allowedDevices(m.activeProfile);
  if (!m.activeProfile) return;
  for (const mapping of m.activeProfile.mappings) {
    const b = mapping.binding;
    switch (b.type) {
      case 'keyboard':
        m.keyboardMap.set(b.code, mapping.snesButton);
        break;
      case 'gamepad-button':
        setScoped(m.gamepadButtonMap, deviceKeyFor(mapping.sourceVid, mapping.sourcePid), b.index, mapping.snesButton);
        break;
      case 'gamepad-axis':
        setScoped(m.gamepadAxisMap, deviceKeyFor(mapping.sourceVid, mapping.sourcePid), `${b.axisIndex}:${b.direction}`, mapping.snesButton);
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
  // Ctrl/Cmd chords (copy/paste/select-all…) are never game input — swallowing
  // them here killed Ctrl+C over hand-selected log text. The modifier key's own
  // keydown still routes normally in case Ctrl itself is mapped.
  if ((e.ctrlKey || e.metaKey) && !e.code.startsWith('Control') && !e.code.startsWith('Meta')) return;

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

const pollFrame = (m: InputManager): void => {
  if (!m.running) return;

  const windowFocused = inputEligible();

  if (windowFocused && !m.pauseManager.isPaused && !m.inputSuppressed) {
    const mask = computeBitmask(m.keyStates, m.keyboardMap, m.gamepadButtonMap, m.gamepadAxisMap, m.hidStates, m.allowed);
    m.setInputFn?.(mask);
  }

  if (windowFocused && m.rawDispatcher.hasListeners) {
    m.rawDispatcher.emitHidEvents(m.hidStates);
  }

  if (windowFocused && !m.inputSuppressed && m.functionActions.hasMappedGamepadButtons) {
    m.functionActions.checkGamepads(m.hidStates, m.allowed);
  }

  if (m.stateListeners.size > 0) {
    if (m.hidStatesDirty) {
      m.currentHidStates = new Map(m.currentHidStates);
      m.hidStatesDirty = false;
    }
    for (const fn of m.stateListeners) {
      try { fn(m.currentHidStates, m.allPressedKeys); } catch { /* ignore */ }
    }
  }

  m.animFrameId = requestAnimationFrame(m.pollLoop);
};

export { isTextInput, rebuildMaps, guardKeys, keyDown, keyUp, pollFrame, connectedGamepadKeys };
