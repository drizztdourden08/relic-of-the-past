/* @layer shared-ipc @kind types */
/**
 * Wire types for the SDL3 controller transport's IPC channels: the "added" event payload and
 * the device snapshot entry shared by `controller:list` and `controller:devices`. Produced in
 * apps/desktop/electron/input/sdl3-source.ts and controller-snapshot.ts.
 */

type ControllerBusType = 'usb' | 'bluetooth' | 'unknown';

/** Bus-agnostic wired/wireless read from SDL's joystick connection state. Windows does not
 *  report USB-vs-Bluetooth for an XInput pad, so this stands in: never guess a bus type from
 *  it, and never show a bus chip and a wired/wireless chip together. */
type ControllerConnectionState = 'wired' | 'wireless' | 'unknown';

/** SDL's own family for the device, lowercased and hyphenated from
 *  SDL_GamepadType. Never a VID/PID guess: SDL answers this about the
 *  device it opened, so no lookup table is involved. */
type ControllerGamepadType =
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

interface ControllerAddedInfo {
  deviceKey: string;
  sdlId: number;
  name: string;
  vendorId: number;
  productId: number;
  guid: string;
  hasRumble: boolean;
  hasGyro: boolean;
  busType: ControllerBusType;
  connectionState: ControllerConnectionState;
  sdlType: ControllerGamepadType;
  /** Indexed by the SDL_GamepadButton enum, length SDL_GAMEPAD_BUTTON_COUNT.
   *  Whether the device has that control at all, from SDL_GamepadHasButton. */
  hasButton: boolean[];
  /** Indexed by the SDL_GamepadAxis enum, length SDL_GAMEPAD_AXIS_COUNT (6),
   *  from SDL_GamepadHasAxis. */
  hasAxis: boolean[];
  /** Indexed like `hasButton`. The label this pad prints for that button
   *  (SDL_GamepadButtonLabel), or '' when SDL does not know. */
  buttonLabels: string[];
}

/** `'ready'`: SDL currently has the device open. `'unavailable'`: seen by the device lister
 *  but not claimed by SDL (held elsewhere, or filtered by SDL's hidapi rules). See device-availability.ts. */
type DeviceStatus = 'ready' | 'unavailable';

/**
 * One row of the raw HID enumeration (`controller:list-hid-devices`): every device
 * `SDL_hid_enumerate` sees, claimed by SDL's gamepad backend or not. A controller read through
 * XInput instead of HID (most Xbox-style pads) never appears here, which is how the gamepad
 * diagnostics wizard tells whether a byte-level capture can work for a device.
 */
interface HidListedDevice {
  vendorId: number;
  productId: number;
  product: string;
  busType: ControllerBusType;
}

/**
 * One row of the full controller snapshot. `sdlId`/`guid`/`hasRumble`/`hasGyro` are only
 * present for `'ready'` devices; an `'unavailable'` one was never opened.
 */
interface DeviceEntry {
  deviceKey: string;
  vendorId: number;
  productId: number;
  /** SDL's own name, present for claimed devices. Absent for a device only
   *  the raw enumeration can see, which has no name to report. */
  name?: string;
  /** The mapping line in use, captured here because the mapping table belongs
   *  to the gamepad subsystem and cannot be queried once it is released. */
  mapping?: string;
  product: string;
  busType: ControllerBusType;
  status: DeviceStatus;
  sdlId?: number;
  guid?: string;
  hasRumble?: boolean;
  hasGyro?: boolean;
  connectionState?: ControllerConnectionState;
  sdlType?: ControllerGamepadType;
  /** Indexed by the SDL_GamepadButton enum. Only present for `'ready'`
   *  devices; an `'unavailable'` one was never opened. */
  hasButton?: boolean[];
  /** Indexed by the SDL_GamepadAxis enum. Only present for `'ready'` devices. */
  hasAxis?: boolean[];
  /** Indexed like `hasButton`. Only present for `'ready'` devices. */
  buttonLabels?: string[];
}

/** Why a diagnostic raw HID capture failed to open. `unavailable-exclusive`
 *  is the expected case for a device SDL's own joystick subsystem already
 *  holds through libusb, not a bug to fix. */
type RawCaptureFailureReason = 'not-found' | 'unavailable-exclusive' | 'error';

/** Outcome of `controller:start-raw-capture`, normalized to `ok` so a caller
 *  never has to branch on which field name the native layer used. */
interface RawCaptureStartResult {
  ok: boolean;
  reason?: RawCaptureFailureReason;
  message?: string;
}

/** One HID input report read while a raw capture is active. */
interface ControllerRawReport {
  vendorId: number;
  productId: number;
  reportId: number;
  bytes: number[];
}

/** One joystick-level state sample: the raw button/axis/hat indices a
 *  gamecontrollerdb mapping line is written in, sized to the device's own
 *  control counts, not the fixed SDL gamepad layout. */
interface ControllerJoystickSample {
  id: number;
  buttons: boolean[];
  axes: number[];
  hats: number[];
}

/** One entry of `controller:list-joysticks`: every joystick SDL currently
 *  has open, whether or not it also has a gamepad mapping. */
interface JoystickInfo {
  id: number;
  name: string;
  guid: string;
  numButtons: number;
  numAxes: number;
  numHats: number;
  hasGamepadMapping: boolean;
}

/** The controller invoke channels, split out of `InvokeContract` (which extends this) only for the line cap. Still the one source of truth. */
interface ControllerInvokeContract {
  'controller:list': () => Promise<DeviceEntry[]>;
  /** Every device the raw HID enumeration sees, regardless of SDL claim state
   *  (see HidListedDevice). Works while SDL's gamepad backend is released. */
  'controller:list-hid-devices': () => Promise<HidListedDevice[]>;
  'controller:rescan': () => Promise<void>;
  'controller:rumble': (deviceKey: string, low: number, high: number, durationMs: number) => Promise<boolean>;
  /** Plays a timed sequence of rumble segments. haptic-pattern-player.ts owns the sequencing
   *  so it runs in the main process instead of a renderer timer. */
  'controller:vibrate-pattern': (deviceKey: string, pattern: { durationMs: number; intensity: number }[], gapMs: number) => Promise<{ ok: boolean; error?: string }>;
  /** Adds a mapping for the live session AND appends it to the user's mapping db. */
  'controller:add-mapping': (mapping: string) => Promise<boolean>;
  /** Writes an input-calibration debug capture into userData/Data/debug and returns the full path. */
  'controller:write-debug-capture': (name: string, data: unknown) => Promise<string>;
  /** Opens a diagnostic raw HID capture on vendorId/productId. Bytes arrive as `controller:raw` events. */
  'controller:start-raw-capture': (vendorId: number, productId: number) => Promise<RawCaptureStartResult>;
  'controller:stop-raw-capture': () => Promise<void>;
  /** Opens a joystick-level capture on an SDL joystick id. Samples arrive as `controller:joystick` events. */
  'controller:start-joystick-capture': (joystickId: number) => Promise<boolean>;
  'controller:stop-joystick-capture': () => Promise<void>;
  /** Every joystick SDL currently has open, mapped or not. */
  'controller:list-joysticks': () => Promise<JoystickInfo[]>;
  /** The gamecontrollerdb mapping line SDL already has for `guid`, or null when unmapped. */
  'controller:mapping-for-guid': (guid: string) => Promise<string | null>;
  /** Version of the SDL3 the native addon is linked against. Recorded in a
   *  controller report, since detection behaviour is tied to it. */
  'controller:sdl-version': () => Promise<string | null>;
  /** Closes every open gamepad+joystick and quits the gamepad subsystem, so a raw HID
   *  open on the same device (see `controller:start-raw-capture`) can succeed. Returns
   *  whether the request was queued; watch `controller:hold-changed` for completion. */
  'controller:release-hold': () => Promise<boolean>;
  /** Restores the gamepad subsystem after `controller:release-hold`, replaying every
   *  mapping this addon has added. Returns whether the request was queued. */
  'controller:restore-hold': () => Promise<boolean>;
}

export type {
  ControllerAddedInfo,
  ControllerBusType,
  ControllerConnectionState,
  ControllerGamepadType,
  ControllerInvokeContract,
  ControllerJoystickSample,
  ControllerRawReport,
  DeviceEntry,
  DeviceStatus,
  HidListedDevice,
  JoystickInfo,
  RawCaptureFailureReason,
  RawCaptureStartResult,
};
