/* @layer shared-input @kind logic */
import { buildConsoleDefaultMappings } from '../../build-console-defaults';
import { computeBitmask } from '../polling-engine';
import type { HidDeviceState } from '../polling-engine.type';
import { setScoped } from '../device-scoped-map';
import type { DeviceScopedMap } from '../device-scoped-map';
import { TOUCH_PAD_KEY } from '../../touch/touch-emit.constants';
import type { SnesButton } from '@rotp/game-data';
import { EMPTY_KEYBOARD, EMPTY_KEYS, TOUCH_ALLOWED } from './touch-bitmask.constants';
import type { TouchMaps } from './touch-bitmask.type';

let cached: TouchMaps | null = null;

const touchMaps = (): TouchMaps => {
  if (cached) return cached;
  const gamepadButtonMap: DeviceScopedMap<number, SnesButton> = new Map();
  const gamepadAxisMap: DeviceScopedMap<string, SnesButton> = new Map();
  for (const mapping of buildConsoleDefaultMappings({ sdlType: 'switch-pro' })) {
    const b = mapping.binding;
    if (b.type === 'gamepad-button') setScoped(gamepadButtonMap, TOUCH_PAD_KEY, b.index, mapping.snesButton);
    if (b.type === 'gamepad-axis') setScoped(gamepadAxisMap, TOUCH_PAD_KEY, `${b.axisIndex}:${b.direction}`, mapping.snesButton);
  }
  cached = { gamepadButtonMap, gamepadAxisMap };
  return cached;
};

const touchBitmask = (pad: HidDeviceState): number =>
  computeBitmask({
    keyStates: EMPTY_KEYS,
    keyboardMap: EMPTY_KEYBOARD,
    ...touchMaps(),
    hidStates: new Map([[TOUCH_PAD_KEY, pad]]),
    allowed: TOUCH_ALLOWED,
  });

export { touchBitmask };
