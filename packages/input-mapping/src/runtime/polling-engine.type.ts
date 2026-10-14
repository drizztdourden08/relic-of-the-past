/* @layer renderer-lib @kind types */
import type { SnesButton } from '@rotp/game-data';
import type { DeviceScopedMap } from './device-scoped-map';
import type { AllowedDevices } from './profile-devices';

interface HidDeviceState {
  buttons: boolean[];
  axes: number[];
}

interface GamepadMaps {
  gamepadButtonMap: DeviceScopedMap<number, SnesButton>;
  gamepadAxisMap: DeviceScopedMap<string, SnesButton>;
}

interface BitmaskSources extends GamepadMaps {
  keyStates: Map<string, boolean>;
  keyboardMap: Map<string, SnesButton>;
  hidStates: Map<string, HidDeviceState>;
  allowed: AllowedDevices;
}

export type { BitmaskSources, GamepadMaps, HidDeviceState };
