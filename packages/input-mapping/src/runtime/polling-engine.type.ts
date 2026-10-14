/* @layer renderer-lib @kind types */
import type { SnesButton } from '@rotp/game-data';
import type { DeviceScopedMap } from './device-scoped-map';

interface HidDeviceState {
  buttons: boolean[];
  axes: number[];
}

interface GamepadMaps {
  gamepadButtonMap: DeviceScopedMap<number, SnesButton>;
  gamepadAxisMap: DeviceScopedMap<string, SnesButton>;
}

export type { GamepadMaps, HidDeviceState };
