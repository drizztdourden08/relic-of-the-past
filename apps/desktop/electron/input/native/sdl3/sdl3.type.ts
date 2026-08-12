/* @layer electron-main @kind types */
/**
 * Types for the SDL3 gamepad Node-API addon (sdl3_input.node).
 *
 * This module describes the raw transport surface only — the fixed SDL button
 * order and axis layout the addon reports. It carries no device-specific or
 * SNES-mapping meaning; that lives in the consumers of this transport.
 */

/** Bus-agnostic wired/wireless read from `SDL_GetJoystickConnectionState`.
 *  This is never a USB-vs-Bluetooth answer: SDL does not report bus type
 *  for an XInput-backed pad, only whether the link itself is wired. */
type Sdl3ConnectionState = 'wired' | 'wireless' | 'unknown';

/** SDL's own family for the device, lowercased and hyphenated from
 *  SDL_GamepadType. Never a VID/PID guess: this is SDL answering about the
 *  device it just opened. */
type Sdl3GamepadType =
  | 'unknown'
  | 'standard'
  | 'xbox360'
  | 'xboxone'
  | 'ps3'
  | 'ps4'
  | 'ps5'
  | 'switch-pro'
  | 'joycon-left'
  | 'joycon-right'
  | 'joycon-pair'
  | 'gamecube';

interface Sdl3AddedEvent {
  type: 'added';
  id: number;
  name: string;
  vendorId: number;
  productId: number;
  guid: string;
  hasRumble: boolean;
  hasGyro: boolean;
  connectionState: Sdl3ConnectionState;
  sdlType: Sdl3GamepadType;
  /** Indexed by the SDL_GamepadButton enum, length SDL_GAMEPAD_BUTTON_COUNT.
   *  From SDL_GamepadHasButton: whether the device has that control at all. */
  hasButton: boolean[];
  /** Indexed by the SDL_GamepadAxis enum, length SDL_GAMEPAD_AXIS_COUNT (6).
   *  From SDL_GamepadHasAxis. */
  hasAxis: boolean[];
  /** Indexed like `hasButton`. The label this pad prints for that button
   *  (SDL_GamepadButtonLabel: 'A' | 'B' | 'X' | 'Y' | 'CROSS' | 'CIRCLE' |
   *  'SQUARE' | 'TRIANGLE'), or '' when SDL does not know. */
  buttonLabels: string[];
}

interface Sdl3RemovedEvent {
  type: 'removed';
  id: number;
}

interface Sdl3StateEvent {
  type: 'state';
  id: number;
  buttons: boolean[];
  axes: number[];
}

interface Sdl3ErrorEvent {
  type: 'error';
  message: string;
}

/** One HID input report read while a raw capture is active, see `startRawCapture`. */
interface Sdl3RawEvent {
  type: 'raw';
  vendorId: number;
  productId: number;
  reportId: number;
  bytes: number[];
}

/**
 * One joystick-level state sample, emitted only while a joystick capture is
 * active and only when something changed since the last sample. Unlike
 * `Sdl3StateEvent`, these arrays are sized to the device's own button/axis/
 * hat counts (see `JoystickInfo`), not the fixed SDL gamepad layout.
 */
interface Sdl3JoystickEvent {
  type: 'joystick';
  id: number;
  buttons: boolean[];
  axes: number[];
  hats: number[];
}

/** Emitted after `releaseGamepads`/`restoreGamepads` completes, so a caller
 *  can tell whether the gamepad subsystem is currently held open for a raw
 *  HID capture. */
interface Sdl3GamepadHoldEvent {
  type: 'gamepad-hold';
  held: boolean;
}

type Sdl3Event =
  | Sdl3AddedEvent
  | Sdl3RemovedEvent
  | Sdl3StateEvent
  | Sdl3ErrorEvent
  | Sdl3RawEvent
  | Sdl3JoystickEvent
  | Sdl3GamepadHoldEvent;

type Sdl3EventCallback = (event: Sdl3Event) => void;

/**
 * One HID device reported by the OS, whether or not SDL could claim it as a
 * gamepad. Already filtered to the generic desktop usage page's joystick/
 * gamepad/multi-axis usages (HID spec constants, not a device list) — see
 * `enumerateHid` in index.ts for why. `busType` is `'unknown'` when the OS
 * doesn't report one.
 */
interface HidDeviceInfo {
  vendorId: number;
  productId: number;
  productString: string;
  manufacturerString: string;
  path: string;
  busType: 'usb' | 'bluetooth' | 'unknown';
}

/**
 * Why a raw capture open failed. `unavailable-exclusive` is the expected
 * case for a controller SDL already holds through libusb: the open
 * failing is not a bug, it is the thing the UI needs to explain.
 * `not-found` means no matching device is enumerable at all; `error`
 * carries whatever SDL reported.
 */
type RawCaptureFailureReason = 'not-found' | 'unavailable-exclusive' | 'error';

/** Outcome of `startRawCapture`. Never a bare boolean: the caller needs to tell these apart. */
type RawCaptureResult = { success: true } | { success: false; reason: RawCaptureFailureReason; message?: string };

/**
 * One entry of `listJoysticks()`: every joystick SDL currently has open,
 * whether or not it also has a gamepad mapping. A controller with no
 * mapping appears here but never through the gamepad `added`/`removed`
 * events. This is what makes it visible to a mapping generator at all.
 */
interface JoystickInfo {
  id: number;
  name: string;
  guid: string;
  numButtons: number;
  numAxes: number;
  numHats: number;
  hasGamepadMapping: boolean;
}

/** The native addon's exact exported surface. */
interface Sdl3Input {
  start(callback: Sdl3EventCallback): void;
  stop(): void;
  rumble(id: number, low: number, high: number, durationMs: number): boolean;
  addMapping(mappingString: string): boolean;
  addMappingsFromFile(path: string): number;
  enumerateHid(): HidDeviceInfo[];
  rescan(): void;
  releaseGamepads(): boolean;
  restoreGamepads(): boolean;
  version(): string;
  startRawCapture(vendorId: number, productId: number): RawCaptureResult;
  stopRawCapture(): void;
  startJoystickCapture(joystickId: number): boolean;
  stopJoystickCapture(): void;
  listJoysticks(): JoystickInfo[];
  mappingForGuid(guid: string): string | null;
}

/**
 * Positional name for each index of a `state` event's `buttons` array, per
 * SDL's fixed SDL_GamepadButton order. Index into this instead of a literal
 * number so a caller never has to guess which slot means what.
 */
const SDL_BUTTON_NAMES = [
  'SOUTH',
  'EAST',
  'WEST',
  'NORTH',
  'BACK',
  'GUIDE',
  'START',
  'LEFT_STICK',
  'RIGHT_STICK',
  'LEFT_SHOULDER',
  'RIGHT_SHOULDER',
  'DPAD_UP',
  'DPAD_DOWN',
  'DPAD_LEFT',
  'DPAD_RIGHT',
  'MISC1',
  'RIGHT_PADDLE1',
  'LEFT_PADDLE1',
  'RIGHT_PADDLE2',
  'LEFT_PADDLE2',
  'TOUCHPAD',
  'MISC2',
  'MISC3',
  'MISC4',
  'MISC5',
  'MISC6',
] as const;

/** Positional name for each index of a `state` event's `axes` array. */
const SDL_AXIS_NAMES = ['LEFTX', 'LEFTY', 'RIGHTX', 'RIGHTY', 'LEFT_TRIGGER', 'RIGHT_TRIGGER'] as const;

export { SDL_AXIS_NAMES, SDL_BUTTON_NAMES };
export type {
  HidDeviceInfo,
  JoystickInfo,
  RawCaptureFailureReason,
  RawCaptureResult,
  Sdl3AddedEvent,
  Sdl3ConnectionState,
  Sdl3ErrorEvent,
  Sdl3Event,
  Sdl3EventCallback,
  Sdl3GamepadHoldEvent,
  Sdl3GamepadType,
  Sdl3Input,
  Sdl3JoystickEvent,
  Sdl3RawEvent,
  Sdl3RemovedEvent,
  Sdl3StateEvent
};
