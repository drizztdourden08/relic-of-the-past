/* @layer shared-input @kind logic */
import { buildConsoleDefaultMappings } from '../../build-console-defaults';
import { computeBitmask } from '../polling-engine';
import type { HidDeviceState } from '../polling-engine.type';
import { setScoped } from '../device-scoped-map';
import type { DeviceScopedMap } from '../device-scoped-map';
import { TOUCH_PAD_KEY } from '../../touch/touch-emit.constants';
import type { SnesButton } from '@rotp/game-data';

const EMPTY_KEYS = new Map<string, boolean>();
const EMPTY_KEYBOARD = new Map<string, SnesButton>();
const TOUCH_ALLOWED = { keyboard: false, gamepadKeys: new Set([TOUCH_PAD_KEY]) };

interface TouchMaps {
  gamepadButtonMap: DeviceScopedMap<number, SnesButton>;
  gamepadAxisMap: DeviceScopedMap<string, SnesButton>;
}

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

/** The SNES button bitmask a touch pad (SDL layout) presses under the standard console-default mapping. */
const touchBitmask = (pad: HidDeviceState): number =>
  computeBitmask({
    keyStates: EMPTY_KEYS,
    keyboardMap: EMPTY_KEYBOARD,
    ...touchMaps(),
    hidStates: new Map([[TOUCH_PAD_KEY, pad]]),
    allowed: TOUCH_ALLOWED,
  });

export { touchBitmask };
