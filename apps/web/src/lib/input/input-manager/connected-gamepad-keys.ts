/* @layer renderer-lib @kind logic */
import type { InputManager } from './input-manager';

const connectedGamepadKeys = (m: InputManager): Set<string> =>
  new Set(m.hidDeviceCache.filter((d) => d.status === 'ready').map((d) => d.deviceKey));

export { connectedGamepadKeys };
