/* @layer renderer-lib @kind logic */
import type { InputProfile, DetectedDevice, PauseListener, RawInputListener, AllowedDevices, DeviceScopedMap, ActiveProfileListener, DeviceChangeListener, InputStateListener } from '@rotp/input-mapping';
import type { SnesButton } from '@rotp/game-data';
import type { FunctionMapping, FunctionAction } from '@rotp/features';
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import { controllerInputStore } from '../controller-input-store';
import type { ControllerInputState } from '../controller-input-store';
import { wasmSetPaused, suspendAudio, resumeAudio } from '@rotp/game-core';
import { PauseManager, FunctionActionEngine, RawInputDispatcher } from '@rotp/input-mapping';
import { startInput } from './start-input';
import { stopInput } from './stop-input';
import { refreshInputDevices } from './refresh-input-devices';
import { rebuildMaps } from './rebuild-maps';
import { guardKeys } from './guard-keys';
import { keyDown } from './key-down';
import { keyUp } from './key-up';
import { pollFrame } from './poll-frame';
import { connectedGamepadKeys } from './connected-gamepad-keys';
import { cycleActiveProfile } from './cycle-active-profile';
import { wireFunctionActions } from './wire-function-actions';

class InputManager {
  activeProfile: InputProfile | null = null;
  profiles: InputProfile[] = [];
  allowed: AllowedDevices = { keyboard: false, gamepadKeys: new Set() };
  activeProfileListeners = new Set<ActiveProfileListener>();
  persistActiveProfileId: ((id: string) => void) | null = null;
  keyStates = new Map<string, boolean>();
  allPressedKeys = new Set<string>();
  animFrameId: number | null = null;
  setInputFn: ((mask: number) => void) | null = null;
  running = false;

  keyboardMap = new Map<string, SnesButton>();
  gamepadButtonMap: DeviceScopedMap<number, SnesButton> = new Map();
  gamepadAxisMap: DeviceScopedMap<string, SnesButton> = new Map();

  hidStates = new Map<string, { buttons: boolean[]; axes: number[] }>();
  hidUnsubscribe: (() => void) | null = null;
  hidDisconnectUnsub: (() => void) | null = null;
  ipcControllerStateUnsub: (() => void) | null = null;
  controllerRemovedUnsub: (() => void) | null = null;
  controllerRawUnsub: (() => void) | null = null;
  controllerNameCacheUnsub: (() => void) | null = null;
  controllerFamilyCacheUnsub: (() => void) | null = null;
  controllerDevicesUnsub: (() => void) | null = null;

  devices: DetectedDevice[] = [];
  deviceListeners = new Set<DeviceChangeListener>();
  hidDeviceCache: DeviceEntry[] = [];

  currentHidStates = new Map<string, ControllerInputState>();
  hidStatesDirty = false;
  stateListeners = new Set<InputStateListener>();
  calibrationLoaded = false;
  devicePollId: ReturnType<typeof setInterval> | null = null;

  inputSuppressed = false;

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
    wireFunctionActions(this);
  }

  guardEmscriptenKeys = (e: KeyboardEvent): void => guardKeys(this, e);
  onKeyDown = (e: KeyboardEvent): void => keyDown(this, e);
  onKeyUp = (e: KeyboardEvent): void => keyUp(this, e);
  pollLoop = (): void => pollFrame(this);

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

  isInputSuppressed(): boolean { return this.inputSuppressed; }
  setWasmBridge(fn: (mask: number) => void): void { this.setInputFn = fn; }

  setProfile(profile: InputProfile): void {
    this.activeProfile = profile;
    rebuildMaps(this);
  }

  getProfile(): InputProfile | null { return this.activeProfile; }
  getProfiles(): InputProfile[] { return this.profiles; }
  setProfiles(profiles: InputProfile[]): void { this.profiles = profiles; }
  setActiveProfilePersist(fn: (id: string) => void): void { this.persistActiveProfileId = fn; }

  onActiveProfileChange(listener: ActiveProfileListener): () => void {
    this.activeProfileListeners.add(listener);
    return () => this.activeProfileListeners.delete(listener);
  }

  cycleActiveProfile(direction: 1 | -1): void { cycleActiveProfile(this, direction); }
  setFunctionMappings(mappings: FunctionMapping[]): void { this.functionActions.setMappings(mappings); }
  getFunctionMappings(): FunctionMapping[] { return this.functionActions.getMappings(); }

  onFunctionAction(action: FunctionAction, callback: () => void): () => void {
    return this.functionActions.onAction(action, callback);
  }

  onFunctionKeyUp(listener: (action: FunctionAction) => void): () => void {
    return this.functionActions.onKeyUp(listener);
  }

  isPaused(): boolean { return this.pauseManager.isPaused; }

  checkControllerPresence(): void {
    this.pauseManager.checkControllerDisconnect(this.activeProfile, connectedGamepadKeys(this), this.devices);
  }

  resumeIfControllerPresent(): void {
    this.pauseManager.resumeIfPresent(this.activeProfile, connectedGamepadKeys(this));
  }

  reevaluateControllerPresence(): void {
    this.pauseManager.reevaluateForProfile(this.activeProfile, connectedGamepadKeys(this), this.devices);
  }

  resume(): void { this.pauseManager.resume(); }
  togglePause(): void { this.pauseManager.togglePause(); }
  onPauseChange(listener: PauseListener): () => void { return this.pauseManager.subscribe(listener); }
  onRawInput(listener: RawInputListener): () => void { return this.rawDispatcher.subscribe(listener); }

  onInputState(listener: InputStateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  getDevices(): DetectedDevice[] { return this.devices; }

  onDeviceChange(listener: DeviceChangeListener): () => void {
    this.deviceListeners.add(listener);
    return () => this.deviceListeners.delete(listener);
  }

  getHidStates(): Map<string, ControllerInputState> { return this.currentHidStates; }
  getPressedKeys(): Set<string> { return this.allPressedKeys; }
  isHidConnected(): boolean { return controllerInputStore.isConnected(); }
  start(): void { startInput(this); }
  stop(): void { stopInput(this); }
  refreshDevices(): void { refreshInputDevices(this); }
}

export { InputManager };
