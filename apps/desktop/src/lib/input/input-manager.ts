/**
 * InputManager — Orchestrator for the renderer input engine.
 *
 * Delegates to focused sub-modules:
 *   - PauseManager — pause/resume state and events
 *   - FunctionActionEngine — shortcut/cheat key bindings
 *   - RawInputDispatcher — rising-edge detection for rebinding UI
 *   - polling-engine — SNES bitmask computation
 *   - controller-lifecycle — HID controller init/reset
 *   - gamepad-vid-pid — VID/PID resolution heuristics
 *   - profile-utils — profile creation from presets, icon resolution
 *
 * Lifecycle: create → start() → stop() → start() → ...
 * Auto-starts on app boot (not just game launch) so Controls/Calibration pages work.
 */

import type { InputProfile, SnesButton, FunctionMapping, FunctionAction } from '@shared/types/controls';
import { KEYBOARD_DEFAULT } from '@shared/input';
import type { DetectedDevice } from '@shared/types/controls';
import { detectAllDevices, markActivated, updateActivationState } from './device-detector';
import { webHidReader } from './hid-reader';
import type { WebHidInputState } from './hid-reader';
import { wasmSetPaused } from '../game/wasm-bridge';
import { suspendAudio, resumeAudio } from '../game/audio-volume';
import { PauseManager } from './pause-manager';
import type { PauseListener } from './pause-manager';
import { FunctionActionEngine } from './function-actions';
import { RawInputDispatcher } from './raw-input-dispatcher';
import type { RawInputEvent, RawInputListener } from './raw-input-dispatcher';
import { computeBitmask, snapshotGamepads } from './polling-engine';
import type { GamepadSnapshot } from './polling-engine';
import { profileFromPreset, resolveFunctionMappingIcon } from './profile-utils';
import { resolveGamepadVidPid } from './gamepad-vid-pid';
import type { HidDeviceInfo } from './gamepad-vid-pid';
import { initController, resetController } from './controller-lifecycle';
import type { ControllerEntry } from './controller-lifecycle';

type DeviceChangeListener = (devices: DetectedDevice[]) => void;

/** Per-frame state listener — for InputCalibration, InputTester visualization */
type InputStateListener = (
  hidStates: Map<string, WebHidInputState>,
  gamepads: GamepadSnapshot[],
  pressedKeys: Set<string>,
) => void;

class InputManager {
  private activeProfile: InputProfile | null = null;
  private keyStates = new Map<string, boolean>();
  private allPressedKeys = new Set<string>();
  private animFrameId: number | null = null;
  private setInputFn: ((mask: number) => void) | null = null;
  private running = false;

  // Binding lookup maps
  private keyboardMap = new Map<string, SnesButton>();
  private gamepadButtonMap = new Map<number, SnesButton>();
  private gamepadAxisMap = new Map<string, SnesButton>();

  // HID input state
  private hidStates = new Map<string, { buttons: boolean[]; axes: number[] }>();
  private hidUnsubscribe: (() => void) | null = null;
  private hidDisconnectUnsub: (() => void) | null = null;
  private ipcReportUnsub: (() => void) | null = null;
  private ipcDisconnectUnsub: (() => void) | null = null;
  private ipcErrorUnsub: (() => void) | null = null;
  private ipcMainPerfUnsub: (() => void) | null = null;
  private ipcDeviceOpenedUnsub: (() => void) | null = null;

  // Device tracking
  private devices: DetectedDevice[] = [];
  private deviceListeners = new Set<DeviceChangeListener>();
  private hidDeviceCache: HidDeviceInfo[] = [];
  private gamepadVidPid = new Map<number, { vid: string; pid: string }>();
  private activeControllers = new Map<string, ControllerEntry>();

  // Per-frame state
  private currentHidStates = new Map<string, WebHidInputState>();
  private hidStatesDirty = false;
  private currentGamepads: GamepadSnapshot[] = [];
  private stateListeners = new Set<InputStateListener>();
  private calibrationLoaded = false;
  private devicePollId: ReturnType<typeof setInterval> | null = null;

  // Input suppression (menu/UI is open)
  private inputSuppressed = false;

  // ─── Sub-modules ───
  readonly pauseManager = new PauseManager();
  private readonly functionActions = new FunctionActionEngine();
  private readonly rawDispatcher = new RawInputDispatcher();

  constructor() {
    this.pauseManager.onPause = (zeroBitmask) => {
      if (zeroBitmask) this.setInputFn?.(0);
      wasmSetPaused(true);
      suspendAudio();
    };
    this.pauseManager.onResume = () => {
      wasmSetPaused(false);
      resumeAudio();
    };
    this.functionActions.onPauseToggle = () => this.pauseManager.togglePause();
  }

  // ─── Public API ───

  setInputSuppressed(suppressed: boolean): void {
    this.inputSuppressed = suppressed;
    if (suppressed) {
      this.functionActions.clearHeld();
      for (const key of this.keyStates.keys()) {
        this.keyStates.set(key, false);
      }
      this.setInputFn?.(0);
    }
  }

  isInputSuppressed(): boolean {
    return this.inputSuppressed;
  }

  setWasmBridge(fn: (mask: number) => void): void {
    this.setInputFn = fn;
  }

  setProfile(profile: InputProfile): void {
    this.activeProfile = profile;
    this.rebuildMaps();
  }

  getProfile(): InputProfile | null {
    return this.activeProfile;
  }

  setFunctionMappings(mappings: FunctionMapping[]): void {
    this.functionActions.setMappings(mappings);
  }

  getFunctionMappings(): FunctionMapping[] {
    return this.functionActions.getMappings();
  }

  onFunctionAction(action: FunctionAction, callback: () => void): () => void {
    return this.functionActions.onAction(action, callback);
  }

  onFunctionKeyUp(listener: (action: FunctionAction) => void): () => void {
    return this.functionActions.onKeyUp(listener);
  }

  isPaused(): boolean {
    return this.pauseManager.isPaused;
  }

  resume(): void {
    this.pauseManager.resume();
  }

  togglePause(): void {
    this.pauseManager.togglePause();
  }

  onPauseChange(listener: PauseListener): () => void {
    return this.pauseManager.subscribe(listener);
  }

  onRawInput(listener: RawInputListener): () => void {
    return this.rawDispatcher.subscribe(listener);
  }

  onInputState(listener: InputStateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  getDevices(): DetectedDevice[] {
    return this.devices;
  }

  onDeviceChange(listener: DeviceChangeListener): () => void {
    this.deviceListeners.add(listener);
    return () => this.deviceListeners.delete(listener);
  }

  getHidStates(): Map<string, WebHidInputState> {
    return this.currentHidStates;
  }

  getGamepads(): GamepadSnapshot[] {
    return this.currentGamepads;
  }

  getPressedKeys(): Set<string> {
    return this.allPressedKeys;
  }

  isHidConnected(): boolean {
    return webHidReader.isConnected();
  }

  // ─── Lifecycle ───

  start(): void {
    if (this.running) return;
    this.running = true;

    if (!this.activeProfile) {
      this.setProfile(profileFromPreset(KEYBOARD_DEFAULT));
    }

    if (!this.calibrationLoaded) {
      this.calibrationLoaded = true;
      window.api.readStickCalibration()
        .then((store) => {
          webHidReader.loadStickCalibrations(store as Record<string, import('./hid-reader').DeviceStickCalibration>);
        })
        .catch(() => {});
      window.api.readTriggerCalibration()
        .then((store) => {
          webHidReader.loadTriggerCalibrations(store);
        })
        .catch(() => {});
    }

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('gamepadconnected', this.onGamepadConnected);
    window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected);
    document.documentElement.addEventListener('keydown', this.guardEmscriptenKeys);
    document.documentElement.addEventListener('keypress', this.guardEmscriptenKeys);

    this.hidUnsubscribe = webHidReader.onInput((state: WebHidInputState) => {
      this.hidStates.set(state.deviceKey, { buttons: state.buttons, axes: state.axes });
      this.currentHidStates.set(state.deviceKey, state);
      this.hidStatesDirty = true;
      this.pauseManager.autoResume();
    });
    this.hidDisconnectUnsub = webHidReader.onDisconnect((_deviceKey) => {
      this.hidStates.delete(_deviceKey);
      this.currentHidStates.delete(_deviceKey);
      this.hidStatesDirty = true;
      this.rawDispatcher.removeDevice(_deviceKey);
      this.refreshDevices();
      this.pauseManager.checkControllerDisconnect(this.activeProfile, this.devices);
    });

    this.ipcReportUnsub = window.api.onHidReport((deviceKey, vendorId, productId, data) => {
      webHidReader.handleIpcReport(deviceKey, vendorId, productId, data);
    });
    this.ipcDisconnectUnsub = window.api.onHidDisconnect((info) => {
      webHidReader.handleIpcDisconnect(info.deviceKey, info.error);
      this.activeControllers.delete(info.deviceKey);
    });
    this.ipcErrorUnsub = window.api.onHidError((info) => {
      webHidReader.addDiag(`⚠ HID error (${info.deviceKey}): ${info.error}`);
      resetController(info.deviceKey, this.activeControllers);
    });
    this.ipcMainPerfUnsub = window.api.onHidMainPerf((msg) => {
      webHidReader.addDiag(`🖥 ${msg}`);
    });
    this.ipcDeviceOpenedUnsub = window.api.onHidDeviceOpened((info) => {
      webHidReader.markDeviceOpened(info.deviceKey, info.product);
      initController(info.deviceKey, info.vendorId, info.productId, this.activeControllers);
    });

    window.api.getOpenHidKeys().then(keys => {
      for (const key of keys) {
        webHidReader.markDeviceOpened(key);
      }
    }).catch(() => {});

    this.refreshDevices();
    this.devicePollId = setInterval(() => this.refreshDevices(), 2000);
    this.pollLoop();
  }

  stop(): void {
    this.running = false;
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('gamepadconnected', this.onGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected);
    document.documentElement.removeEventListener('keydown', this.guardEmscriptenKeys);
    document.documentElement.removeEventListener('keypress', this.guardEmscriptenKeys);

    this.hidUnsubscribe?.(); this.hidUnsubscribe = null;
    this.hidDisconnectUnsub?.(); this.hidDisconnectUnsub = null;
    this.ipcReportUnsub?.(); this.ipcReportUnsub = null;
    this.ipcDisconnectUnsub?.(); this.ipcDisconnectUnsub = null;
    this.ipcErrorUnsub?.(); this.ipcErrorUnsub = null;
    this.ipcMainPerfUnsub?.(); this.ipcMainPerfUnsub = null;
    this.ipcDeviceOpenedUnsub?.(); this.ipcDeviceOpenedUnsub = null;

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
    this.setInputFn?.(0);
  }

  // ─── Device management ───

  refreshDevices(): void {
    this.devices = detectAllDevices(this.hidDeviceCache);
    for (const dev of this.devices) {
      if (dev.inputApi === 'hid' && dev.vendorId && dev.productId) {
        const key = `${dev.vendorId}:${dev.productId}`;
        dev.stale = webHidReader.isDeviceStale(key);
      }
    }
    for (const fn of this.deviceListeners) {
      try { fn(this.devices); } catch { /* ignore */ }
    }

    window.api.enumerateHidDevices()
      .then(hidDevices => {
        this.hidDeviceCache = hidDevices;
        const updated = detectAllDevices(hidDevices);
        for (const dev of updated) {
          if (dev.inputApi === 'hid' && dev.vendorId && dev.productId) {
            const key = `${dev.vendorId}:${dev.productId}`;
            dev.stale = webHidReader.isDeviceStale(key);
          }
        }
        if (JSON.stringify(updated) !== JSON.stringify(this.devices)) {
          this.devices = updated;
          for (const fn of this.deviceListeners) {
            try { fn(this.devices); } catch { /* ignore */ }
          }
        }
        const gamepads = navigator.getGamepads();
        for (const gp of gamepads) {
          if (gp && gp.connected && !this.gamepadVidPid.has(gp.index)) {
            this.doResolveGamepadVidPid(gp);
          }
        }
      })
      .catch(() => {});
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

  private guardEmscriptenKeys = (e: KeyboardEvent): void => {
    if (isTextInput(e.target) || this.inputSuppressed) {
      e.stopPropagation();
    }
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (isTextInput(e.target)) return;
    // Escape is reserved for app-level menu toggle — never process as game/function input
    if (e.code === 'Escape') return;
    this.allPressedKeys.add(e.code);
    this.rawDispatcher.emit({ type: 'keyboard', code: e.code }, 'keyboard');

    if (this.inputSuppressed) return;

    if (!e.repeat) {
      if (this.functionActions.handleKeyDown(e.code, e.shiftKey, e.ctrlKey, e.altKey)) {
        e.preventDefault();
        return;
      }
    }

    if (this.keyboardMap.has(e.code)) {
      e.preventDefault();
      this.keyStates.set(e.code, true);
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.allPressedKeys.delete(e.code);
    if (this.keyboardMap.has(e.code)) {
      this.keyStates.set(e.code, false);
    }
    if (!this.inputSuppressed) {
      this.functionActions.handleKeyUp(e.code);
    }
  };

  private onGamepadConnected = (e: GamepadEvent): void => {
    markActivated(e.gamepad.index);
    updateActivationState();
    this.doResolveGamepadVidPid(e.gamepad);
    this.refreshDevices();
    this.pauseManager.autoResume();
  };

  private onGamepadDisconnected = (): void => {
    updateActivationState();
    this.refreshDevices();
    this.pauseManager.checkControllerDisconnect(this.activeProfile, this.devices);
  };

  private doResolveGamepadVidPid(gp: Gamepad): void {
    const alreadyMapped = new Set([...this.gamepadVidPid.values()].map(v => `${v.vid}:${v.pid}`));
    const result = resolveGamepadVidPid(gp, this.hidDeviceCache, alreadyMapped);
    if (result) {
      this.gamepadVidPid.set(gp.index, result);
    }
  }

  private pollLoop = (): void => {
    if (!this.running) return;

    this.currentGamepads = snapshotGamepads();

    if (!this.pauseManager.isPaused && !this.inputSuppressed) {
      const mask = computeBitmask(this.keyStates, this.keyboardMap, this.gamepadButtonMap, this.gamepadAxisMap, this.hidStates);
      this.setInputFn?.(mask);
    }

    if (this.rawDispatcher.hasListeners) {
      this.rawDispatcher.emitGamepadEvents(this.gamepadVidPid);
      this.rawDispatcher.emitHidEvents(this.hidStates);
    }

    if (!this.inputSuppressed && this.functionActions.hasMappedGamepadButtons) {
      this.functionActions.checkGamepads(this.hidStates);
    }

    if (this.stateListeners.size > 0) {
      if (this.hidStatesDirty) {
        this.currentHidStates = new Map(this.currentHidStates);
        this.hidStatesDirty = false;
      }
      for (const fn of this.stateListeners) {
        try { fn(this.currentHidStates, this.currentGamepads, this.allPressedKeys); } catch { /* ignore */ }
      }
    }

    this.animFrameId = requestAnimationFrame(this.pollLoop);
  };
}

// ─── Helpers ───

function isTextInput(target: EventTarget | null): boolean {
  if (!target) return false;
  const tag = (target as HTMLElement).tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' ||
         (target as HTMLElement).isContentEditable;
}

// ─── Singleton ───

let instance: InputManager | null = null;

function getInputManager(): InputManager {
  if (!instance) {
    instance = new InputManager();
    instance.start();
  }
  if (typeof window !== 'undefined') (window as any).__inputManager = instance;
  return instance;
}

export { InputManager, getInputManager, profileFromPreset, resolveFunctionMappingIcon };
export type { DeviceChangeListener, InputStateListener, PauseListener, RawInputEvent, RawInputListener, GamepadSnapshot };
