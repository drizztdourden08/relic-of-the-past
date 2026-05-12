/**
 * InputManager — Core input engine.
 *
 * Listens for keyboard events and polls the Gamepad API each frame.
 * Maps physical inputs → SNES bitmask using the active InputProfile's mappings.
 * Calls WasmSetInput(bitmask) each frame via the WASM bridge.
 *
 * Lifecycle: create → start() → stop() → start() → ...
 */

import type { InputProfile, InputBinding, SnesButton } from '@shared/types/controls';
import { SNES_BUTTON_BITS } from '@shared/types/controls';
import { KEYBOARD_DEFAULT } from '@shared/data/controllers';
import type { DetectedDevice } from '@shared/types/controls';
import { detectAllDevices } from './controller-detect';
import { webHidReader } from './webhid-input-reader';
import type { WebHidInputState } from './webhid-input-reader';

export type DeviceChangeListener = (devices: DetectedDevice[]) => void;
export type PauseListener = (paused: boolean, controllerName: string) => void;

export class InputManager {
  private activeProfile: InputProfile | null = null;
  private keyStates = new Map<string, boolean>(); // KeyboardEvent.code → pressed
  private animFrameId: number | null = null;
  private setInputFn: ((mask: number) => void) | null = null;
  private running = false;
  private paused = false;
  private pausedControllerName = '';

  // Device tracking
  private devices: DetectedDevice[] = [];
  private deviceListeners = new Set<DeviceChangeListener>();
  private pauseListeners = new Set<PauseListener>();

  // Keyboard binding lookup: KeyboardEvent.code → SnesButton
  private keyboardMap = new Map<string, SnesButton>();
  // Gamepad button lookup: button index → SnesButton
  private gamepadButtonMap = new Map<number, SnesButton>();
  // Gamepad axis lookup: "axisIndex:direction" → SnesButton
  private gamepadAxisMap = new Map<string, SnesButton>();

  // HID input state (from WebHID reader for Switch/PS/8BitDo)
  private hidStates = new Map<string, { buttons: boolean[]; axes: number[] }>();
  private hidUnsubscribe: (() => void) | null = null;

  /**
   * Set the function that pushes the bitmask to WASM.
   * Called with Module.ccall('WasmSetInput', ...) wrapper.
   */
  setWasmBridge(fn: (mask: number) => void): void {
    this.setInputFn = fn;
  }

  /**
   * Load an input profile and rebuild lookup tables.
   */
  setProfile(profile: InputProfile): void {
    this.activeProfile = profile;
    this.rebuildMaps();
  }

  getProfile(): InputProfile | null {
    return this.activeProfile;
  }

  /**
   * Start listening for input and polling gamepads.
   */
  start(): void {
    if (this.running) return;
    this.running = true;

    // If no profile set, use keyboard default
    if (!this.activeProfile) {
      this.setProfile(profileFromPreset(KEYBOARD_DEFAULT));
    }

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('gamepadconnected', this.onGamepadConnected);
    window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected);

    // Subscribe to WebHID input (Switch, PS, 8BitDo)
    this.hidUnsubscribe = webHidReader.onInput((state: WebHidInputState) => {
      this.hidStates.set(state.deviceKey, { buttons: state.buttons, axes: state.axes });
    });
    // Auto-connect to previously granted devices
    webHidReader.autoConnect();

    // Initial device scan
    this.refreshDevices();

    // Start frame loop
    this.pollLoop();
  }

  /**
   * Stop all input processing.
   */
  stop(): void {
    this.running = false;
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('gamepadconnected', this.onGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected);

    // Unsubscribe from HID input
    if (this.hidUnsubscribe) {
      this.hidUnsubscribe();
      this.hidUnsubscribe = null;
    }
    this.hidStates.clear();

    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.keyStates.clear();
    // Push zero to release all buttons
    this.setInputFn?.(0);
  }

  /**
   * Get currently detected devices.
   */
  getDevices(): DetectedDevice[] {
    return this.devices;
  }

  /**
   * Subscribe to device connect/disconnect events.
   */
  onDeviceChange(listener: DeviceChangeListener): () => void {
    this.deviceListeners.add(listener);
    return () => this.deviceListeners.delete(listener);
  }

  /**
   * Force a device rescan and notify listeners.
   */
  refreshDevices(): void {
    this.devices = detectAllDevices();
    for (const fn of this.deviceListeners) {
      try { fn(this.devices); } catch { /* ignore */ }
    }
  }

  /**
   * Subscribe to pause/resume events (controller disconnect/reconnect).
   */
  onPauseChange(listener: PauseListener): () => void {
    this.pauseListeners.add(listener);
    return () => this.pauseListeners.delete(listener);
  }

  /**
   * Is the game currently paused due to controller disconnect?
   */
  isPaused(): boolean {
    return this.paused;
  }

  /**
   * Resume from controller-disconnect pause.
   */
  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    this.pausedControllerName = '';
    for (const fn of this.pauseListeners) {
      try { fn(false, ''); } catch { /* ignore */ }
    }
  }

  /**
   * Toggle pause (F10 or manual).
   */
  togglePause(): void {
    if (this.paused) {
      this.resume();
    } else {
      this.paused = true;
      this.pausedControllerName = 'Manual pause';
      this.setInputFn?.(0);
      for (const fn of this.pauseListeners) {
        try { fn(true, 'Manual pause'); } catch { /* ignore */ }
      }
    }
  }

  // ─── Private ───

  private rebuildMaps(): void {
    this.keyboardMap.clear();
    this.gamepadButtonMap.clear();
    this.gamepadAxisMap.clear();

    if (!this.activeProfile) return;

    for (const mapping of this.activeProfile.mappings) {
      const b = mapping.binding;
      switch (b.type) {
        case 'keyboard':
          this.keyboardMap.set(b.code, mapping.snesButton);
          break;
        case 'gamepad-button':
          this.gamepadButtonMap.set(b.index, mapping.snesButton);
          break;
        case 'gamepad-axis':
          this.gamepadAxisMap.set(`${b.axisIndex}:${b.direction}`, mapping.snesButton);
          break;
      }
    }
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    // Don't capture when typing in inputs
    if (isTextInput(e.target)) return;

    if (this.keyboardMap.has(e.code)) {
      e.preventDefault();
      this.keyStates.set(e.code, true);
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    if (this.keyboardMap.has(e.code)) {
      e.preventDefault();
      this.keyStates.set(e.code, false);
    }
  };

  private onGamepadConnected = (): void => {
    this.refreshDevices();
    // If paused due to disconnect, auto-resume when any gamepad reconnects
    if (this.paused && this.pausedControllerName !== 'Manual pause') {
      this.resume();
    }
  };

  private onGamepadDisconnected = (): void => {
    this.refreshDevices();
    // If the active profile has an assigned gamepad controller, check if it's still connected
    const assigned = this.activeProfile?.assignedController;
    if (assigned && assigned.controllerFamily !== 'keyboard') {
      const stillConnected = this.devices.some(
        d => d.vendorId === assigned.vendorId && d.productId === assigned.productId && d.connected
      );
      if (!stillConnected && !this.paused) {
        this.paused = true;
        this.pausedControllerName = assigned.displayName;
        this.setInputFn?.(0);
        for (const fn of this.pauseListeners) {
          try { fn(true, assigned.displayName); } catch { /* ignore */ }
        }
      }
    }
  };

  private pollLoop = (): void => {
    if (!this.running) return;

    if (this.paused) {
      // Still keep the frame loop alive to detect resume
      this.animFrameId = requestAnimationFrame(this.pollLoop);
      return;
    }

    const mask = this.computeBitmask();
    this.setInputFn?.(mask);

    this.animFrameId = requestAnimationFrame(this.pollLoop);
  };

  private computeBitmask(): number {
    let mask = 0;

    // Keyboard
    for (const [code, pressed] of this.keyStates) {
      if (pressed) {
        const btn = this.keyboardMap.get(code);
        if (btn !== undefined) {
          mask |= (1 << SNES_BUTTON_BITS[btn]);
        }
      }
    }

    // Web Gamepad API (XInput controllers like Xbox)
    const gamepads = navigator.getGamepads();
    for (const gp of gamepads) {
      if (!gp || !gp.connected) continue;

      // Buttons
      for (const [index, snesBtn] of this.gamepadButtonMap) {
        if (index < gp.buttons.length && gp.buttons[index].pressed) {
          mask |= (1 << SNES_BUTTON_BITS[snesBtn]);
        }
      }

      // Axes
      for (const [key, snesBtn] of this.gamepadAxisMap) {
        const [axisStr, dir] = key.split(':');
        const axisIndex = parseInt(axisStr, 10);
        if (axisIndex < gp.axes.length) {
          const val = gp.axes[axisIndex];
          const threshold = 0.5;
          if ((dir === '+' && val > threshold) || (dir === '-' && val < -threshold)) {
            mask |= (1 << SNES_BUTTON_BITS[snesBtn]);
          }
        }
      }
    }

    // HID input (Switch Pro, PlayStation, 8BitDo — read from main process)
    for (const [, state] of this.hidStates) {
      // Buttons: same standard 16-button layout
      for (const [index, snesBtn] of this.gamepadButtonMap) {
        if (index < state.buttons.length && state.buttons[index]) {
          mask |= (1 << SNES_BUTTON_BITS[snesBtn]);
        }
      }

      // Axes
      for (const [key, snesBtn] of this.gamepadAxisMap) {
        const [axisStr, dir] = key.split(':');
        const axisIndex = parseInt(axisStr, 10);
        if (axisIndex < state.axes.length) {
          const val = state.axes[axisIndex];
          const threshold = 0.5;
          if ((dir === '+' && val > threshold) || (dir === '-' && val < -threshold)) {
            mask |= (1 << SNES_BUTTON_BITS[snesBtn]);
          }
        }
      }
    }

    return mask;
  }
}

// ─── Helpers ───

function isTextInput(target: EventTarget | null): boolean {
  if (!target) return false;
  const tag = (target as HTMLElement).tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' ||
         (target as HTMLElement).isContentEditable;
}

/** Create an InputProfile from a ControllerPreset for use as defaults. */
function profileFromPreset(preset: import('@shared/types/controls').ControllerPreset): InputProfile {
  return {
    id: `default-${preset.id}`,
    name: preset.name,
    deviceType: preset.family === 'keyboard' ? 'keyboard' : 'gamepad',
    controllerFamily: preset.family,
    mappings: [...preset.defaultMappings],
    isDefault: true,
    assignedController: null,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  };
}

// ─── Singleton ───

let instance: InputManager | null = null;

export function getInputManager(): InputManager {
  if (!instance) {
    instance = new InputManager();
  }
  return instance;
}

export { profileFromPreset };
