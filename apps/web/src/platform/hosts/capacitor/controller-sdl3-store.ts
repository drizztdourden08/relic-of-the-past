/* @layer renderer-other @kind logic */
/**
 * Live SDL3 controller tracker for the Android ControllerSdl3 plugin.
 * Starts/stops the native gamepad subsystem, decodes its added/removed/
 * state events into a deviceKey-indexed map of every gamepad currently
 * open, and serves that map as: already-decoded button/axis state
 * (onControllerState), rumble/vibration, and the DeviceEntry snapshot the
 * device list and calibration screens read (see install-controller-api.ts).
 *
 * A device that has connected but that nobody has touched yet still shows
 * up here: the map is built entirely from "added"/"removed" events, never
 * inferred from "state" traffic, so an untouched pad is not mistaken for a
 * disconnected one.
 */
import { assignDeviceKey, deviceKeyForId, releaseDeviceKey } from './controller-sdl3-device-key';
import { controllerSdl3Plugin, isControllerSdl3Available, onControllerSdl3Event } from './controller-sdl3-plugin';
import { buildAndroidSnapshot } from './controller-sdl3-snapshot';
import type { LiveDevice } from './controller-sdl3-snapshot';
import { Sdl3VibratePatternPlayer } from './controller-sdl3-vibrate';
import type { Sdl3AndroidEvent } from './controller-sdl3.type';
import type { DeviceEntry } from '@shared/ipc';
import type { HidDeviceInfo, VibrateResult, VibrateStep } from '@shared/platform';

type StateListener = (deviceKey: string, buttons: boolean[], axes: number[]) => void;
type DevicesListener = (devices: DeviceEntry[]) => void;
type RemovedListener = (deviceKey: string) => void;

class Sdl3ControllerStore {
  private live = new Map<string, LiveDevice>();
  private stateListeners = new Set<StateListener>();
  private devicesListeners = new Set<DevicesListener>();
  private removedListeners = new Set<RemovedListener>();
  private eventUnsub: (() => void) | null = null;
  private started = false;
  private vibratePlayer = new Sdl3VibratePatternPlayer(
    (deviceKey, low, high, durationMs) => this.rumble(deviceKey, low, high, durationMs),
  );

  /** Starts the native gamepad subsystem. No-op (logs once) when the plugin
   *  isn't registered, or when the native library/SDL_Init failed. */
  async start(): Promise<void> {
    if (this.started) return;
    if (!isControllerSdl3Available()) {
      console.log('[controllers] ControllerSdl3 plugin not available on this build');
      return;
    }
    // Subscribe before starting, never after: the native side begins polling
    // the moment start() is called and announces already-connected pads on its
    // very first tick, well before an await resolves. Subscribing afterwards
    // drops those announcements on the floor, and since a pad that is already
    // plugged in never announces itself again, it would stay invisible for the
    // whole session.
    this.eventUnsub = onControllerSdl3Event((event) => this.handleEvent(event));
    const { ok } = await controllerSdl3Plugin().start();
    if (!ok) {
      this.eventUnsub?.();
      this.eventUnsub = null;
      console.log('[controllers] SDL3 native library unavailable on this device');
      return;
    }
    this.started = true;
    console.log('[controllers] started');
  }

  stop(): void {
    if (!this.started) return;
    this.started = false;
    this.eventUnsub?.();
    this.eventUnsub = null;
    controllerSdl3Plugin().stop().catch(() => {});
    this.live.clear();
  }

  snapshot(): DeviceEntry[] {
    return buildAndroidSnapshot(this.live);
  }

  /** Re-broadcasts the current snapshot. Android has no separate raw HID
   *  lister to re-scan, so this is the closest honest equivalent of the
   *  desktop "look again" action. */
  rescan(): void {
    this.emitDevices();
  }

  hidDeviceInfoSnapshot(): HidDeviceInfo[] {
    return Array.from(this.live.values()).map((device) => ({
      vendorId: device.vendorId.toString(16).padStart(4, '0'),
      productId: device.productId.toString(16).padStart(4, '0'),
      product: device.name,
      manufacturer: '',
      path: device.deviceKey,
      serialNumber: null,
    }));
  }

  onControllerState(cb: StateListener): () => void {
    this.stateListeners.add(cb);
    return () => { this.stateListeners.delete(cb); };
  }

  onDevicesChanged(cb: DevicesListener): () => void {
    this.devicesListeners.add(cb);
    return () => { this.devicesListeners.delete(cb); };
  }

  onRemoved(cb: RemovedListener): () => void {
    this.removedListeners.add(cb);
    return () => { this.removedListeners.delete(cb); };
  }

  vibratePattern(deviceKey: string, pattern: VibrateStep[], gapMs: number): Promise<VibrateResult> {
    return this.vibratePlayer.play(deviceKey, pattern, gapMs);
  }

  private async rumble(deviceKey: string, low: number, high: number, durationMs: number): Promise<boolean> {
    const device = this.live.get(deviceKey);
    if (!device) return false;
    const result = await controllerSdl3Plugin().rumble({ id: device.sdlId, low, high, durationMs });
    return result.ok;
  }

  private handleEvent(event: Sdl3AndroidEvent): void {
    if (event.type === 'added') this.handleAdded(event);
    else if (event.type === 'removed') this.handleRemoved(event);
    else if (event.type === 'state') this.handleState(event);
  }

  private handleAdded(event: Extract<Sdl3AndroidEvent, { type: 'added' }>): void {
    const deviceKey = assignDeviceKey(event.id, event.vendorId, event.productId);
    this.live.set(deviceKey, {
      deviceKey,
      sdlId: event.id,
      name: event.name,
      vendorId: event.vendorId,
      productId: event.productId,
      guid: event.guid,
      hasRumble: event.hasRumble,
      hasGyro: event.hasGyro,
      connectionState: event.connectionState,
      sdlType: event.sdlType,
      hasButton: event.hasButton,
      hasAxis: event.hasAxis,
      buttonLabels: event.buttonLabels,
    });
    this.emitDevices();
  }

  private handleRemoved(event: Extract<Sdl3AndroidEvent, { type: 'removed' }>): void {
    const deviceKey = releaseDeviceKey(event.id);
    if (!deviceKey) return;
    this.live.delete(deviceKey);
    for (const cb of this.removedListeners) cb(deviceKey);
    this.emitDevices();
  }

  private handleState(event: Extract<Sdl3AndroidEvent, { type: 'state' }>): void {
    const deviceKey = deviceKeyForId(event.id);
    if (!deviceKey) return;
    for (const cb of this.stateListeners) cb(deviceKey, event.buttons, event.axes);
  }

  private emitDevices(): void {
    const snapshot = this.snapshot();
    for (const cb of this.devicesListeners) cb(snapshot);
  }
}

const sdl3ControllerStore = new Sdl3ControllerStore();

export { Sdl3ControllerStore, sdl3ControllerStore };
