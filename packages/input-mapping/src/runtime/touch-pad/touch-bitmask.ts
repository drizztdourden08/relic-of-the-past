/* @layer shared-input @kind logic */
import { buildConsoleDefaultMappings } from '../../build-console-defaults';
import { computeBitmask } from '../polling-engine';
import type { HidDeviceState } from '../polling-engine.type';
import { setScoped } from '../device-scoped-map';
import { TOUCH_PAD_KEY } from '../../touch/touch-emit.constants';
import type { InputBinding, SnesButton } from '@rotp/game-data';
import { EMPTY_KEYBOARD, EMPTY_KEYS, NO_CLASSIC, TOUCH_ALLOWED } from './touch-bitmask.constants';
import type { TouchClassicBindings, TouchMaps } from './touch-bitmask.type';

let cached: TouchMaps | null = null;

let cachedFor: TouchClassicBindings | null = null;

const addMapping = (maps: TouchMaps, binding: InputBinding, snesButton: SnesButton): void => {
  if (binding.type === 'gamepad-button') setScoped(maps.gamepadButtonMap, TOUCH_PAD_KEY, binding.index, snesButton);
  if (binding.type === 'gamepad-axis') setScoped(maps.gamepadAxisMap, TOUCH_PAD_KEY, `${binding.axisIndex}:${binding.direction}`, snesButton);
};

const touchMaps = (classic: TouchClassicBindings): TouchMaps => {
  if (cached && cachedFor === classic) return cached;
  const maps: TouchMaps = { gamepadButtonMap: new Map(), gamepadAxisMap: new Map() };
  for (const mapping of buildConsoleDefaultMappings({ sdlType: 'switch-pro' })) {
    if (classic[mapping.snesButton]) continue;
    addMapping(maps, mapping.binding, mapping.snesButton);
  }
  for (const [id, binding] of Object.entries(classic)) addMapping(maps, binding, id as SnesButton);
  cached = maps;
  cachedFor = classic;
  return maps;
};

const touchBitmask = (pad: HidDeviceState, classic: TouchClassicBindings = NO_CLASSIC): number =>
  computeBitmask({
    keyStates: EMPTY_KEYS,
    keyboardMap: EMPTY_KEYBOARD,
    ...touchMaps(classic),
    hidStates: new Map([[TOUCH_PAD_KEY, pad]]),
    allowed: TOUCH_ALLOWED,
  });

export { touchBitmask };
