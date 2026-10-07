/* @layer electron-main @kind logic */
/**
 * SDL3 controller transport: owns the native addon's lifecycle in main and
 * translates its raw events into the `controller:*` IPC contract. The sole
 * controller input transport (started from ipc-handlers.ts).
 *
 * deviceKey rule: bindings/profiles/calibration are keyed by "vid:pid"
 * (4-hex-digit lowercase, e.g. "057e:2009"), which MUST keep working for one
 * device per vid:pid. A four-port adapter exposes four devices sharing one
 * vid:pid, so the second and later get a "#N" suffix (N = 2, 3, ...). A freed
 * discriminator can be reused by a later connect without changing the key of
 * any device still connected. See sdl3-device-key.ts.
 *
 * Listed-device cache: `listDevices()` is a synchronous native HID enumeration
 * (~10ms on a 2-device machine). Calling it per `controller:list` stalled the
 * calibration screen, so it runs only on connect, disconnect and rescan.
 */
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

  /** Starts polling. No-op (logs once) when the native addon isn't available. */
  start(win: BrowserWindow): void {
    this.window = win;
    if (!sdl3.isAvailable()) {
      console.log('[controllers] not started: native addon unavailable');
      return;
    }
    // Order matters: listDevices() bottoms out in SDL's own hidapi, and reaching
    // it before the SDL thread initialises leaves the gamepad backend unable to
    // claim anything through HIDAPI (no rumble, no gyro, no input).
    sdl3.start((event) => this.handleEvent(event));
    this.refreshListedCache();
    console.log('[controllers] started');
  }

  stop(): void {
    sdl3.stop();
    this.live.clear();
  }

  /** User-initiated "look again". The OS-level listing can change without any
   *  SDL claim event (a device SDL still can't claim), hence the cache refresh. */
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

  /** Opens a diagnostic raw HID capture for the gamepad diagnostics wizard.
   *  Bytes arrive as `controller:raw` events on whichever window called this. */
  startRawCapture(vendorId: number, productId: number): RawCaptureStartResult {
    const result = sdl3.startRawCapture(vendorId, productId);
    return result.success ? { ok: true } : { ok: false, reason: result.reason, message: result.message };
  }

  stopRawCapture(): void {
    sdl3.stopRawCapture();
  }

  /** Opens a joystick-level capture for the gamepad diagnostics wizard.
   *  Samples arrive as `controller:joystick` events. */
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

  /** Releases the gamepad subsystem so a raw HID open on the same device can
   *  succeed. `listSnapshot()` naturally reports no claimed devices while held,
   *  since every gamepad closes through the normal `removed` path first. */
  releaseHold(): boolean {
    return sdl3.releaseGamepads();
  }

  /** Restores the gamepad subsystem after `releaseHold`. Sufficient on its own. */
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

export { Sdl3Source, sdl3Source };
