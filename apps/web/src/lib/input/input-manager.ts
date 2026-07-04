/* @layer renderer-lib @kind logic */
/**
 * InputManager — Orchestrator for the renderer input engine.
 *
 * Delegates to focused sub-modules (PauseManager, FunctionActionEngine,
 * RawInputDispatcher, polling-engine, controller-lifecycle, gamepad-vid-pid,
 * profile-utils) and to input-manager-{lifecycle,events} for start/stop wiring,
 * device refresh, key/gamepad handlers, and the per-frame poll loop.
 *
 * Fields are intentionally non-private so the lifecycle/events helpers can operate
 * on the instance (compile-time only — no runtime effect).
 *
 * Lifecycle: create → start() → stop() → start() → ...
 */

import type { InputProfile, SnesButton, FunctionMapping, FunctionAction } from '@shared/types/controls';
import type { DetectedDevice } from '@shared/types/controls';
import { webHidReader } from './hid-reader';
import type { WebHidInputState } from './hid-reader';
import { wasmSetPaused } from '../game/wasm-bridge';
import { suspendAudio, resumeAudio } from '../game/audio-volume';
import { PauseManager } from './pause-manager';
import type { PauseListener } from './pause-manager';
import { FunctionActionEngine } from './function-actions';
import { RawInputDispatcher } from './raw-input-dispatcher';
import type { RawInputEvent, RawInputListener } from './raw-input-dispatcher';
import type { GamepadSnapshot } from './polling-engine';
import type { HidDeviceInfo } from './gamepad-vid-pid';
import type { ControllerEntry } from './controller-lifecycle';
import { startInput, stopInput, refreshDevicesImpl } from './input-manager-lifecycle';
import { rebuildMaps, guardKeys, keyDown, keyUp, gamepadConnected, gamepadDisconnected, pollFrame } from './input-manager-events';
import { wireProfileActions, setProfiles as setProfilesImpl, subscribeActiveProfile, cycleActiveProfile as cycleActiveProfileImpl } from './input-manager-profiles';
import type { AllowedDevices } from './profile-devices';
import type { ActiveProfileListener, DeviceChangeListener, InputStateListener } from './input-manager-types';

class InputManager {
  activeProfile: InputProfile | null = null;
  // All saved input profiles, kept in sync so the profile-cycle shortcut can switch
  // the active one during gameplay (settings screen not required).
  profiles: InputProfile[] = [];
  // Devices the active profile's map references — the input gate whitelists these.
  allowed: AllowedDevices = { keyboard: false, gamepadKeys: new Set() };
  activeProfileListeners = new Set<ActiveProfileListener>();
  persistActiveProfileId: ((id: string) => void) | null = null;
  keyStates = new Map<string, boolean>();
  allPressedKeys = new Set<string>();
  animFrameId: number | null = null;
  setInputFn: ((mask: number) => void) | null = null;
  running = false;

  // Binding lookup maps
  keyboardMap = new Map<string, SnesButton>();
  gamepadButtonMap = new Map<number, SnesButton>();
  gamepadAxisMap = new Map<string, SnesButton>();

  // HID input state
  hidStates = new Map<string, { buttons: boolean[]; axes: number[] }>();
  hidUnsubscribe: (() => void) | null = null;
  hidDisconnectUnsub: (() => void) | null = null;
  ipcReportUnsub: (() => void) | null = null;
  ipcDisconnectUnsub: (() => void) | null = null;
  ipcErrorUnsub: (() => void) | null = null;
  ipcMainPerfUnsub: (() => void) | null = null;
  ipcDeviceOpenedUnsub: (() => void) | null = null;

  // Device tracking
  devices: DetectedDevice[] = [];
  deviceListeners = new Set<DeviceChangeListener>();
  hidDeviceCache: HidDeviceInfo[] = [];
  gamepadVidPid = new Map<number, { vid: string; pid: string }>();
  activeControllers = new Map<string, ControllerEntry>();

  // Per-frame state
  currentHidStates = new Map<string, WebHidInputState>();
  hidStatesDirty = false;
  currentGamepads: GamepadSnapshot[] = [];
  stateListeners = new Set<InputStateListener>();
  calibrationLoaded = false;
  devicePollId: ReturnType<typeof setInterval> | null = null;

  // Input suppression (menu/UI is open)
  inputSuppressed = false;

  // ─── Sub-modules ───
  readonly pauseManager = new PauseManager();
  readonly functionActions = new FunctionActionEngine();
  readonly rawDispatcher = new RawInputDispatcher();

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
    wireProfileActions(this);
  }

  // ─── Event handler fields (stable identity for add/removeEventListener) ───
  guardEmscriptenKeys = (e: KeyboardEvent): void => guardKeys(this, e);
  onKeyDown = (e: KeyboardEvent): void => keyDown(this, e);
  onKeyUp = (e: KeyboardEvent): void => keyUp(this, e);
  onGamepadConnected = (e: GamepadEvent): void => gamepadConnected(this, e);
  onGamepadDisconnected = (): void => gamepadDisconnected(this);
  pollLoop = (): void => pollFrame(this);

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
    rebuildMaps(this);
  }

  getProfile(): InputProfile | null {
    return this.activeProfile;
  }

  setProfiles(profiles: InputProfile[]): void {
    setProfilesImpl(this, profiles);
  }

  /** Wire persistence of the active profile id (survives app restart). */
  setActiveProfilePersist(fn: (id: string) => void): void {
    this.persistActiveProfileId = fn;
  }

  onActiveProfileChange(listener: ActiveProfileListener): () => void {
    return subscribeActiveProfile(this, listener);
  }

  cycleActiveProfile(direction: 1 | -1): void {
    cycleActiveProfileImpl(this, direction);
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

  // ─── Lifecycle / device refresh (delegated) ───

  start(): void {
    startInput(this);
  }

  stop(): void {
    stopInput(this);
  }

  refreshDevices(): void {
    refreshDevicesImpl(this);
  }
}

// ─── Singleton ───

let instance: InputManager | null = null;

const getInputManager = (): InputManager => {
  if (!instance) {
    instance = new InputManager();
    instance.start();
  }
  if (typeof window !== 'undefined') (window as any).__inputManager = instance;
  return instance;
};

/** Return the existing InputManager without creating/starting one (null if none). */
const peekInputManager = (): InputManager | null => instance;

export { InputManager, getInputManager, peekInputManager };
export { profileFromPreset, resolveFunctionMappingIcon } from './profile-utils';
export type { ActiveProfileListener, DeviceChangeListener, InputStateListener } from './input-manager-types';
export type { PauseListener } from './pause-manager';
export type { RawInputEvent, RawInputListener } from './raw-input-dispatcher';
export type { GamepadSnapshot } from './polling-engine';
