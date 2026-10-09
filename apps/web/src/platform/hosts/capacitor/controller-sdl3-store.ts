/* @layer renderer-other @kind logic */
import { assignDeviceKey, deviceKeyForId, releaseDeviceKey } from './controller-sdl3-device-key';
import { controllerSdl3Plugin, isControllerSdl3Available, onControllerSdl3Event } from './controller-sdl3-plugin';
import { buildAndroidSnapshot } from './controller-sdl3-snapshot';
import { Sdl3VibratePatternPlayer } from './controller-sdl3-vibrate';
import type { DevicesListener, LiveDevice, RemovedListener, Sdl3AndroidEvent, StateListener } from './controller-sdl3.type';
import type { DeviceEntry } from '@shared/ipc';
import type { HidDeviceInfo, VibrateResult, VibrateStep } from '@shared/platform';

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

  async start(): Promise<void> {
    if (this.started) return;
    if (!isControllerSdl3Available()) {
      console.log('[controllers] ControllerSdl3 plugin not available on this build');
      return;
    }
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

export { sdl3ControllerStore };
export type { Sdl3ControllerStore };
