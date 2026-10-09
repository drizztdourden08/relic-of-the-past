/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';
import * as sdl3 from './native/sdl3';
import type { Sdl3Event } from './native/sdl3';
import { emit } from '../lib/ipc/handle';
import { DeviceKeyAssigner } from './sdl3-device-key';
import { listDevices } from './device-lister';
import { buildDeviceSnapshot } from './controller-snapshot';
import type { LiveDevice } from './controller-snapshot';
import type { ListedDevice } from './device-lister.type';
import type { EventContract } from '@shared/ipc';
import type { ControllerBusType, JoystickInfo, RawCaptureStartResult } from '@shared/ipc/controller-contract';

const busTypeFor = (listed: readonly ListedDevice[], vendorId: number, productId: number): ControllerBusType =>
  listed.find((d) => d.vendorId === vendorId && d.productId === productId)?.busType ?? 'unknown';

class Sdl3Source {
  private window: BrowserWindow | null = null;
  private keys = new DeviceKeyAssigner();
  private live = new Map<string, LiveDevice>();
  private listedCache: ListedDevice[] = [];

  start(win: BrowserWindow): void {
    this.window = win;
    if (!sdl3.isAvailable()) {
      console.log('[controllers] not started: native addon unavailable');
      return;
    }
    sdl3.start((event) => this.handleEvent(event));
    this.refreshListedCache();
    console.log('[controllers] started');
  }

  stop(): void {
    sdl3.stop();
    this.live.clear();
  }

  rescan(): void {
    sdl3.rescan();
    this.refreshListedCache();
    this.emitSnapshot();
  }

  rumble(deviceKey: string, low: number, high: number, durationMs: number): boolean {
    const device = this.live.get(deviceKey);
    if (!device) return false;
    return sdl3.rumble(device.sdlId, low, high, durationMs);
  }

  listSnapshot(): ReturnType<typeof buildDeviceSnapshot> {
    return buildDeviceSnapshot(this.live, this.listedCache);
  }

  private refreshListedCache(): void {
    this.listedCache = listDevices();
  }

  startRawCapture(vendorId: number, productId: number): RawCaptureStartResult {
    const result = sdl3.startRawCapture(vendorId, productId);
    return result.success ? { ok: true } : { ok: false, reason: result.reason, message: result.message };
  }

  stopRawCapture(): void {
    sdl3.stopRawCapture();
  }

  startJoystickCapture(joystickId: number): boolean {
    return sdl3.startJoystickCapture(joystickId);
  }

  stopJoystickCapture(): void {
    sdl3.stopJoystickCapture();
  }

  listJoysticks(): JoystickInfo[] {
    return sdl3.listJoysticks();
  }

  mappingForGuid(guid: string): string | null {
    return sdl3.mappingForGuid(guid);
  }

  releaseHold(): boolean {
    return sdl3.releaseGamepads();
  }

  restoreHold(): boolean {
    return sdl3.restoreGamepads();
  }

  private handleEvent(event: Sdl3Event): void {
    if (event.type === 'added') this.handleAdded(event);
    else if (event.type === 'removed') this.handleRemoved(event);
    else if (event.type === 'state') this.handleState(event);
    else if (event.type === 'error') console.log(`[SDL3] ${event.message}`);
    else if (event.type === 'raw') this.handleRaw(event);
    else if (event.type === 'joystick') this.handleJoystick(event);
    else if (event.type === 'gamepad-hold') this.emit('controller:hold-changed', event.held);
  }

  private handleRaw(event: Extract<Sdl3Event, { type: 'raw' }>): void {
    this.emit('controller:raw', { vendorId: event.vendorId, productId: event.productId, reportId: event.reportId, bytes: event.bytes });
  }

  private handleJoystick(event: Extract<Sdl3Event, { type: 'joystick' }>): void {
    this.emit('controller:joystick', { id: event.id, buttons: event.buttons, axes: event.axes, hats: event.hats });
  }

  private handleAdded(event: Extract<Sdl3Event, { type: 'added' }>): void {
    const deviceKey = this.keys.assign(event.id, event.vendorId, event.productId);
    this.refreshListedCache();
    const busType = busTypeFor(this.listedCache, event.vendorId, event.productId);
    const mapping = sdl3.mappingForGuid(event.guid);
    this.live.set(deviceKey, {
      deviceKey,
      name: event.name,
      sdlId: event.id,
      vendorId: event.vendorId,
      productId: event.productId,
      guid: event.guid,
      mapping,
      hasRumble: event.hasRumble,
      hasGyro: event.hasGyro,
      connectionState: event.connectionState,
      sdlType: event.sdlType,
      hasButton: event.hasButton,
      hasAxis: event.hasAxis,
      buttonLabels: event.buttonLabels,
    });

    this.emit('controller:added', {
      deviceKey, sdlId: event.id, name: event.name, vendorId: event.vendorId, productId: event.productId,
      guid: event.guid, hasRumble: event.hasRumble, hasGyro: event.hasGyro, busType,
      connectionState: event.connectionState, sdlType: event.sdlType,
      hasButton: event.hasButton, hasAxis: event.hasAxis, buttonLabels: event.buttonLabels,
    });
    this.emitSnapshot();
  }

  private handleRemoved(event: Extract<Sdl3Event, { type: 'removed' }>): void {
    const deviceKey = this.keys.release(event.id);
    if (!deviceKey) return;
    this.live.delete(deviceKey);
    this.refreshListedCache();
    this.emit('controller:removed', deviceKey);
    this.emitSnapshot();
  }

  private handleState(event: Extract<Sdl3Event, { type: 'state' }>): void {
    const deviceKey = this.keys.keyFor(event.id);
    if (!deviceKey) return;
    this.emit('controller:state', deviceKey, event.buttons, event.axes);
  }

  private emitSnapshot(): void {
    this.emit('controller:devices', this.listSnapshot());
  }

  private emit<K extends keyof EventContract>(channel: K, ...args: Parameters<EventContract[K]>): void {
    if (this.window) emit(this.window, channel, ...args);
  }
}

const sdl3Source = new Sdl3Source();

export { sdl3Source };
