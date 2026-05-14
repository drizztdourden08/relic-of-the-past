/**
 * InputManager — Core input engine.
 *
 * Listens for keyboard events, polls the Gamepad API, and subscribes to WebHID
 * each frame. Maps physical inputs → SNES bitmask using the active InputProfile.
 * Exposes per-device state for visualization (InputCalibration, InputTester).
 *
 * Lifecycle: create → start() → stop() → start() → ...
 * Auto-starts on app boot (not just game launch) so Controls/Calibration pages work.
 */

import type { InputProfile, InputBinding, SnesButton } from '@shared/types/controls';
import { SNES_BUTTON_BITS } from '@shared/types/controls';
import { KEYBOARD_DEFAULT, parseGamepadId } from '@shared/data/controllers';
import type { DetectedDevice } from '@shared/types/controls';
import { detectAllDevices, markActivated, updateActivationState } from './controller-detect';
import { webHidReader } from './webhid-input-reader';
import type { WebHidInputState } from './webhid-input-reader';

export type DeviceChangeListener = (devices: DetectedDevice[]) => void;
export type PauseListener = (paused: boolean, controllerName: string) => void;

/** Raw input event — fired when any button/key/axis is pressed on any device */
export interface RawInputEvent {
  binding: InputBinding;
  /** Source device key, e.g. "057e:2009" for HID, "gamepad-0" for WebAPI, "keyboard" */
  sourceDeviceKey: string;
  /** Resolved VID (hex, 4-char padded) when available */
  vendorId: string | null;
  /** Resolved PID (hex, 4-char padded) when available */
  productId: string | null;
}
export type RawInputListener = (event: RawInputEvent) => void;

/** Per-device input state snapshot — buttons + axes for visualization */
export interface DeviceInputState {
  buttons: boolean[];
  axes: number[];
  timestamp: number;
}

/** Gamepad snapshot matching the shape InputCalibration/InputTester need */
export interface GamepadSnapshot {
  index: number;
  id: string;
  connected: boolean;
  mapping: string;
  timestamp: number;
  buttons: { pressed: boolean; touched: boolean; value: number }[];
  axes: number[];
}

export type InputStateListener = (
  hidStates: Map<string, WebHidInputState>,
  gamepads: GamepadSnapshot[],
  pressedKeys: Set<string>,
) => void;

export class InputManager {
  private activeProfile: InputProfile | null = null;
  private keyStates = new Map<string, boolean>(); // KeyboardEvent.code → pressed
  private allPressedKeys = new Set<string>(); // ALL pressed keys (not just mapped) for visualization
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

  // Raw input listeners — for rebinding UI, input tester, etc.
  private rawInputListeners = new Set<RawInputListener>();

  // Per-frame state listeners — for InputCalibration, InputTester visualization
  private stateListeners = new Set<InputStateListener>();

  // Previous frame state for rising-edge detection (raw input events)
  private prevGamepadButtons = new Map<number, boolean[]>(); // gamepad index → buttons
  private prevHidButtons = new Map<string, boolean[]>(); // device key → buttons

  // Gamepad index → resolved VID/PID (populated from parseGamepadId or HID cache fallback)
  private gamepadVidPid = new Map<number, { vid: string; pid: string }>();

  // Cached per-frame state for getters
  private currentHidStates = new Map<string, WebHidInputState>();
  private currentGamepads: GamepadSnapshot[] = [];

  // Calibration loaded flag
  private calibrationLoaded = false;

  // Periodic device re-enumeration
  private devicePollId: ReturnType<typeof setInterval> | null = null;

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

    // Load stick calibrations from disk → webHidReader (so axes are calibrated for everyone)
    if (!this.calibrationLoaded) {
      this.calibrationLoaded = true;
      window.api.readStickCalibration()
        .then((store) => {
          webHidReader.loadStickCalibrations(store as Record<string, import('./webhid-input-reader').DeviceStickCalibration>);
        })
        .catch(() => { /* no calibration file yet — that's fine */ });
    }

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('gamepadconnected', this.onGamepadConnected);
    window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected);

    // Subscribe to WebHID input (Switch, PS, 8BitDo)
    this.hidUnsubscribe = webHidReader.onInput((state: WebHidInputState) => {
      this.hidStates.set(state.deviceKey, { buttons: state.buttons, axes: state.axes });
      this.currentHidStates.set(state.deviceKey, state);
    });
    // Auto-connect to previously granted devices
    webHidReader.autoConnect();

    // Initial device scan
    this.refreshDevices();

    // Periodic re-enumeration (HID devices may connect/disconnect)
    this.devicePollId = setInterval(() => this.refreshDevices(), 2000);

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
    this.currentHidStates.clear();
    this.currentGamepads = [];
    this.allPressedKeys.clear();

    if (this.devicePollId !== null) {
      clearInterval(this.devicePollId);
      this.devicePollId = null;
    }

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

  // Cached HID device list (from main process node-hid enumeration)
  private hidDeviceCache: Array<{ vendorId: string; productId: string; product: string; manufacturer: string; path: string; serialNumber: string | null }> = [];

  /**
   * Force a device rescan and notify listeners.
   * Enumerates HID devices from main process for accurate detection without button press.
   */
  refreshDevices(): void {
    // Synchronous update with cached HID list + WebHID devices
    this.devices = detectAllDevices(this.hidDeviceCache);
    for (const fn of this.deviceListeners) {
      try { fn(this.devices); } catch { /* ignore */ }
    }

    // Async: re-enumerate HID devices from main process, then update again if changed
    window.api.enumerateHidDevices()
      .then(hidDevices => {
        this.hidDeviceCache = hidDevices;
        const updated = detectAllDevices(hidDevices);
        // Only notify if device list actually changed
        if (JSON.stringify(updated) !== JSON.stringify(this.devices)) {
          this.devices = updated;
          for (const fn of this.deviceListeners) {
            try { fn(this.devices); } catch { /* ignore */ }
          }
        }
        // Re-resolve any gamepads that are missing VID/PID (HID cache may now have data)
        const gamepads = navigator.getGamepads();
        for (const gp of gamepads) {
          if (gp && gp.connected && !this.gamepadVidPid.has(gp.index)) {
            this.resolveGamepadVidPid(gp);
          }
        }
      })
      .catch(() => { /* node-hid may fail on some systems */ });
  }

  /**
   * Subscribe to pause/resume events (controller disconnect/reconnect).
   */
  onPauseChange(listener: PauseListener): () => void {
    this.pauseListeners.add(listener);
    return () => this.pauseListeners.delete(listener);
  }

  /**
   * Subscribe to raw input events — fires for every button/key press from any source.
   * Used by BindingListener for remapping, input tester, etc.
   */
  onRawInput(listener: RawInputListener): () => void {
    this.rawInputListeners.add(listener);
    return () => this.rawInputListeners.delete(listener);
  }

  /**
   * Subscribe to per-frame input state — fires every frame with full device state.
   * Used by InputCalibration, InputTester for live visualization.
   * Replaces the need for each component to run its own polling loop.
   */
  onInputState(listener: InputStateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  /**
   * Get current WebHID device states (already calibrated axes).
   */
  getHidStates(): Map<string, WebHidInputState> {
    return this.currentHidStates;
  }

  /**
   * Get current gamepad snapshots (filtered to exclude WebHID duplicates).
   */
  getGamepads(): GamepadSnapshot[] {
    return this.currentGamepads;
  }

  /**
   * Get all currently pressed keyboard keys.
   */
  getPressedKeys(): Set<string> {
    return this.allPressedKeys;
  }

  /**
   * Whether the WebHID reader has any connected devices.
   */
  isHidConnected(): boolean {
    return webHidReader.isConnected();
  }

  private emitRawInput(binding: InputBinding, sourceDeviceKey: string, vendorId: string | null = null, productId: string | null = null): void {
    if (this.rawInputListeners.size === 0) return;
    const event: RawInputEvent = { binding, sourceDeviceKey, vendorId, productId };
    for (const fn of this.rawInputListeners) {
      try { fn(event); } catch { /* ignore */ }
    }
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

    // Track ALL pressed keys for visualization
    this.allPressedKeys.add(e.code);

    if (this.keyboardMap.has(e.code)) {
      e.preventDefault();
      this.keyStates.set(e.code, true);
    }

    // Emit raw input for any key press (not just mapped ones)
    this.emitRawInput({ type: 'keyboard', code: e.code }, 'keyboard');
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.allPressedKeys.delete(e.code);

    if (this.keyboardMap.has(e.code)) {
      e.preventDefault();
      this.keyStates.set(e.code, false);
    }
  };

  private onGamepadConnected = (e: GamepadEvent): void => {
    markActivated(e.gamepad.index);
    updateActivationState();
    this.resolveGamepadVidPid(e.gamepad);
    this.refreshDevices();
    // If paused due to disconnect, auto-resume when any gamepad reconnects
    if (this.paused && this.pausedControllerName !== 'Manual pause') {
      this.resume();
    }
  };

  private onGamepadDisconnected = (): void => {
    updateActivationState();
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

  /**
   * Resolve and cache VID/PID for a gamepad index.
   * First tries parseGamepadId. If that fails (XInput often omits VID/PID),
   * searches HID device cache to match by name keywords.
   */
  private resolveGamepadVidPid(gp: Gamepad): void {
    const parsed = parseGamepadId(gp.id);
    if (parsed && parsed.vid !== '0000') {
      this.gamepadVidPid.set(gp.index, {
        vid: parsed.vid.toLowerCase().padStart(4, '0'),
        pid: parsed.pid.toLowerCase().padStart(4, '0'),
      });
      return;
    }
    // XInput fallback: match gamepad.id keywords to HID device cache
    const idLower = gp.id.toLowerCase();
    for (const hid of this.hidDeviceCache) {
      const hidName = (hid.product || '').toLowerCase();
      const hidMfg = (hid.manufacturer || '').toLowerCase();
      // Match Xbox controllers
      if ((idLower.includes('xbox') || idLower.includes('xinput')) &&
          (hidName.includes('xbox') || hidMfg.includes('microsoft') || hid.vendorId.toLowerCase().padStart(4, '0') === '045e')) {
        this.gamepadVidPid.set(gp.index, {
          vid: hid.vendorId.toLowerCase().padStart(4, '0'),
          pid: hid.productId.toLowerCase().padStart(4, '0'),
        });
        return;
      }
      // Match PlayStation controllers
      if ((idLower.includes('dualshock') || idLower.includes('dualsense') || idLower.includes('playstation')) &&
          (hidName.includes('dual') || hidMfg.includes('sony') || hid.vendorId.toLowerCase().padStart(4, '0') === '054c')) {
        this.gamepadVidPid.set(gp.index, {
          vid: hid.vendorId.toLowerCase().padStart(4, '0'),
          pid: hid.productId.toLowerCase().padStart(4, '0'),
        });
        return;
      }
    }
    // Last resort: if there's exactly one unmatched gamepad-type HID device, use it
    const alreadyMapped = new Set([...this.gamepadVidPid.values()].map(v => `${v.vid}:${v.pid}`));
    const unmatchedHid = this.hidDeviceCache.filter(h => {
      const key = `${h.vendorId.toLowerCase().padStart(4, '0')}:${h.productId.toLowerCase().padStart(4, '0')}`;
      if (alreadyMapped.has(key)) return false;
      const name = (h.product || '').toLowerCase();
      return !name.includes('mouse') && !name.includes('keyboard') && !name.includes('trackpad');
    });
    if (unmatchedHid.length === 1) {
      this.gamepadVidPid.set(gp.index, {
        vid: unmatchedHid[0].vendorId.toLowerCase().padStart(4, '0'),
        pid: unmatchedHid[0].productId.toLowerCase().padStart(4, '0'),
      });
    }
  }

  private pollLoop = (): void => {
    if (!this.running) return;

    // Snapshot gamepads (filter duplicates with WebHID)
    this.currentGamepads = this.snapshotGamepads();

    if (!this.paused) {
      const mask = this.computeBitmask();
      this.setInputFn?.(mask);

      // Emit raw input events for newly pressed buttons (rising edge)
      if (this.rawInputListeners.size > 0) {
        this.emitRawGamepadEvents();
        this.emitRawHidEvents();
      }
    }

    // Emit per-frame state to all visualization listeners
    if (this.stateListeners.size > 0) {
      for (const fn of this.stateListeners) {
        try { fn(this.currentHidStates, this.currentGamepads, this.allPressedKeys); } catch { /* ignore */ }
      }
    }

    this.animFrameId = requestAnimationFrame(this.pollLoop);
  };

  private snapshotGamepads(): GamepadSnapshot[] {
    const raw = navigator.getGamepads();
    const snaps: GamepadSnapshot[] = [];
    // Get WebHID device VID:PID strings to filter duplicates
    const hidDevices = webHidReader.getDevices();
    const hidIds = new Set(hidDevices.map(d =>
      `${d.vendorId.toString(16).padStart(4, '0')}:${d.productId.toString(16).padStart(4, '0')}`
    ));
    for (const gp of raw) {
      if (!gp || !gp.connected) continue;
      // Skip gamepad if its ID contains both VID and PID already claimed by WebHID
      const gpIdLower = gp.id.toLowerCase();
      let isDuplicate = false;
      for (const hidId of hidIds) {
        const [vid, pid] = hidId.split(':');
        if (gpIdLower.includes(`vendor: ${vid}`) && gpIdLower.includes(`product: ${pid}`)) {
          isDuplicate = true;
          break;
        }
      }
      if (isDuplicate) continue;
      snaps.push({
        index: gp.index,
        id: gp.id,
        connected: gp.connected,
        mapping: gp.mapping,
        timestamp: gp.timestamp,
        buttons: gp.buttons.map(b => ({ pressed: b.pressed, touched: b.touched, value: b.value })),
        axes: [...gp.axes],
      });
    }
    return snaps;
  }

  private emitRawGamepadEvents(): void {
    const gamepads = navigator.getGamepads();
    for (const gp of gamepads) {
      if (!gp || !gp.connected) continue;
      const prev = this.prevGamepadButtons.get(gp.index) ?? [];
      const curr = gp.buttons.map(b => b.pressed);
      // Resolve VID/PID from cache (populated on gamepadconnected)
      const cached = this.gamepadVidPid.get(gp.index);
      const vid = cached?.vid ?? null;
      const pid = cached?.pid ?? null;
      for (let i = 0; i < curr.length; i++) {
        if (curr[i] && !prev[i]) {
          this.emitRawInput({ type: 'gamepad-button', index: i }, `gamepad-${gp.index}`, vid, pid);
        }
      }
      // Axes
      for (let i = 0; i < gp.axes.length; i++) {
        const val = gp.axes[i];
        if (Math.abs(val) > 0.7) {
          this.emitRawInput(
            { type: 'gamepad-axis', axisIndex: i, direction: val > 0 ? '+' : '-' },
            `gamepad-${gp.index}`,
            vid, pid,
          );
        }
      }
      this.prevGamepadButtons.set(gp.index, curr);
    }
  }

  private emitRawHidEvents(): void {
    for (const [deviceKey, state] of this.hidStates) {
      const prev = this.prevHidButtons.get(deviceKey) ?? [];
      // deviceKey is "57e:2069" or "057e:2069" format — pad to 4 chars
      const parts = deviceKey.split(':');
      const vid = parts[0] ? parts[0].toLowerCase().padStart(4, '0') : null;
      const pid = parts[1] ? parts[1].toLowerCase().padStart(4, '0') : null;
      for (let i = 0; i < state.buttons.length; i++) {
        if (state.buttons[i] && !prev[i]) {
          this.emitRawInput({ type: 'gamepad-button', index: i }, deviceKey, vid, pid);
        }
      }
      // Axes
      for (let i = 0; i < state.axes.length; i++) {
        if (Math.abs(state.axes[i]) > 0.7) {
          this.emitRawInput(
            { type: 'gamepad-axis', axisIndex: i, direction: state.axes[i] > 0 ? '+' : '-' },
            deviceKey, vid, pid,
          );
        }
      }
      this.prevHidButtons.set(deviceKey, [...state.buttons]);
    }
  }

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

/**
 * Get the InputManager singleton. Auto-starts on first call so that
 * Controls/Calibration pages have live input without needing the game running.
 */
export function getInputManager(): InputManager {
  if (!instance) {
    instance = new InputManager();
    instance.start();
  }
  return instance;
}

export { profileFromPreset };
