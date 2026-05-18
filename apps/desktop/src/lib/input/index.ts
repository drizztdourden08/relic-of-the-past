/**
 * Input engine — public API for the renderer input subsystem.
 */

export { InputManager, getInputManager, profileFromPreset, resolveFunctionMappingIcon } from './input-manager';
export type { DeviceChangeListener, InputStateListener, RawInputEvent, RawInputListener, PauseListener, GamepadSnapshot } from './input-manager';
export { webHidReader } from './hid-reader';
export type { WebHidInputState, DeviceStickCalibration, WebHidRawReport } from './hid-reader';
export { vibrateGamepad, vibrateGamepadPattern, vibrate, vibratePattern } from './vibration';
export { detectAllDevices } from './device-detector';
