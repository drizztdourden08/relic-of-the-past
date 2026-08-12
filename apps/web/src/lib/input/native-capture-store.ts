/* @layer renderer-lib @kind logic */
/**
 * Renderer wrappers for the SDL3 diagnostic capture IPC surface: raw HID
 * bytes and joystick-level button/axis/hat samples, both keyed to whichever
 * capture the gamepad diagnostics wizard currently has open. Desktop-only,
 * same as controller-devices-store.ts next to it: window.api is always
 * present (real preload on Electron, a generated no-op shim elsewhere), so
 * these are thin, direct pass-throughs rather than a cross-platform port.
 */
import type { ControllerJoystickSample, ControllerRawReport, JoystickInfo, RawCaptureStartResult } from '@shared/ipc';

const startRawCapture = (vendorId: number, productId: number): Promise<RawCaptureStartResult> =>
  window.api.startControllerRawCapture(vendorId, productId);

const stopRawCapture = (): Promise<void> => window.api.stopControllerRawCapture();

const startJoystickCapture = (joystickId: number): Promise<boolean> =>
  window.api.startJoystickCapture(joystickId);

const stopJoystickCapture = (): Promise<void> => window.api.stopJoystickCapture();

const listJoysticks = (): Promise<JoystickInfo[]> => window.api.listJoysticks();

const mappingForGuid = (guid: string): Promise<string | null> => window.api.mappingForGuid(guid);

const onControllerRaw = (cb: (report: ControllerRawReport) => void): (() => void) =>
  window.api.onControllerRaw(cb);

const onControllerJoystick = (cb: (sample: ControllerJoystickSample) => void): (() => void) =>
  window.api.onControllerJoystick(cb);

export {
  listJoysticks,
  mappingForGuid,
  onControllerJoystick,
  onControllerRaw,
  startJoystickCapture,
  startRawCapture,
  stopJoystickCapture,
  stopRawCapture,
};
