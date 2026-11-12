/* @layer shared-input @kind types */
import type { InputBinding, SnesButton } from '@rotp/game-data';
import type { DeviceScopedMap } from '../device-scoped-map';

interface TouchMaps {
  gamepadButtonMap: DeviceScopedMap<number, SnesButton>;
  gamepadAxisMap: DeviceScopedMap<string, SnesButton>;
}

type TouchClassicBindings = Readonly<Record<string, InputBinding>>;

export type { TouchClassicBindings, TouchMaps };
