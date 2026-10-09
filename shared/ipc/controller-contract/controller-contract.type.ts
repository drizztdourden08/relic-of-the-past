/* @layer shared-ipc @kind types */
type ControllerBusType = 'usb' | 'bluetooth' | 'unknown';

type ControllerConnectionState = 'wired' | 'wireless' | 'unknown';

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
  hasButton: boolean[];
  hasAxis: boolean[];
  buttonLabels: string[];
}

type DeviceStatus = 'ready' | 'unavailable';

interface HidListedDevice {
  vendorId: number;
  productId: number;
  product: string;
  busType: ControllerBusType;
}

interface DeviceEntry {
  deviceKey: string;
  vendorId: number;
  productId: number;
  name?: string;
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
  hasButton?: boolean[];
  hasAxis?: boolean[];
  buttonLabels?: string[];
}

type RawCaptureFailureReason = 'not-found' | 'unavailable-exclusive' | 'error';

interface RawCaptureStartResult {
  ok: boolean;
  reason?: RawCaptureFailureReason;
  message?: string;
}

interface ControllerRawReport {
  vendorId: number;
  productId: number;
  reportId: number;
  bytes: number[];
}

interface ControllerJoystickSample {
  id: number;
  buttons: boolean[];
  axes: number[];
  hats: number[];
}

interface JoystickInfo {
  id: number;
  name: string;
  guid: string;
  numButtons: number;
  numAxes: number;
  numHats: number;
  hasGamepadMapping: boolean;
}

interface ControllerInvokeContract {
  'controller:list': () => Promise<DeviceEntry[]>;
  'controller:list-hid-devices': () => Promise<HidListedDevice[]>;
  'controller:rescan': () => Promise<void>;
  'controller:rumble': (deviceKey: string, low: number, high: number, durationMs: number) => Promise<boolean>;
  'controller:vibrate-pattern': (deviceKey: string, pattern: { durationMs: number; intensity: number }[], gapMs: number) => Promise<{ ok: boolean; error?: string }>;
  'controller:add-mapping': (mapping: string) => Promise<boolean>;
  'controller:write-debug-capture': (name: string, data: unknown) => Promise<string>;
  'controller:start-raw-capture': (vendorId: number, productId: number) => Promise<RawCaptureStartResult>;
  'controller:stop-raw-capture': () => Promise<void>;
  'controller:start-joystick-capture': (joystickId: number) => Promise<boolean>;
  'controller:stop-joystick-capture': () => Promise<void>;
  'controller:list-joysticks': () => Promise<JoystickInfo[]>;
  'controller:mapping-for-guid': (guid: string) => Promise<string | null>;
  'controller:sdl-version': () => Promise<string | null>;
  'controller:release-hold': () => Promise<boolean>;
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
