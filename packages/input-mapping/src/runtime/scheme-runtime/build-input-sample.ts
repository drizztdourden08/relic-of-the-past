/* @layer renderer-lib @kind logic */
import type { GamepadSample, InputSample } from '../../scheme';
import { SDL_AXIS } from '@rotp/game-data';
import { resolveAxisPressThreshold, STICK_DIRECTION_PRESS_THRESHOLD } from '../axis-press-threshold';
import type { AllowedDevices } from '../profile-devices';
import { NO_KEYS } from './scheme-runtime.constants';

const buildInputSample = (
  keys: ReadonlySet<string>,
  hidStates: Map<string, { buttons: boolean[]; axes: number[] }>,
  allowed: AllowedDevices,
): InputSample => {
  const pads: GamepadSample[] = [];
  let triggerThreshold: number | undefined;
  for (const [deviceKey, state] of hidStates) {
    if (!allowed.gamepadKeys.has(deviceKey)) continue;
    pads.push(state);
    if (triggerThreshold === undefined) triggerThreshold = resolveAxisPressThreshold(SDL_AXIS.LEFT_TRIGGER, deviceKey);
  }
  return {
    keys: allowed.keyboard ? keys : NO_KEYS,
    pads,
    axisThreshold: STICK_DIRECTION_PRESS_THRESHOLD,
    triggerThreshold,
  };
};

export { buildInputSample };
