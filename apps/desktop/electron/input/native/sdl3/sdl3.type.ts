/* @layer electron-main @kind types */
type Sdl3ConnectionState = 'wired' | 'wireless' | 'unknown';

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
  hasButton: boolean[];
  hasAxis: boolean[];
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

interface Sdl3RawEvent {
  type: 'raw';
  vendorId: number;
  productId: number;
  reportId: number;
  bytes: number[];
}

interface Sdl3JoystickEvent {
  type: 'joystick';
  id: number;
  buttons: boolean[];
  axes: number[];
  hats: number[];
}

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

interface HidDeviceInfo {
  vendorId: number;
  productId: number;
  productString: string;
  manufacturerString: string;
  path: string;
  busType: 'usb' | 'bluetooth' | 'unknown';
}

type RawCaptureFailureReason = 'not-found' | 'unavailable-exclusive' | 'error';

type RawCaptureResult = { success: true } | { success: false; reason: RawCaptureFailureReason; message?: string };

interface JoystickInfo {
  id: number;
  name: string;
  guid: string;
  numButtons: number;
  numAxes: number;
  numHats: number;
  hasGamepadMapping: boolean;
}

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
