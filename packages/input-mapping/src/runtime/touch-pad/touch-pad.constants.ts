/* @layer shared-input @kind constants */
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import { TOUCH_PAD_KEY } from '../../touch/touch-emit.constants';

const W3C_TO_SDL_BUTTON: Readonly<Record<number, number>> = {
  0: 0, 1: 1, 2: 2, 3: 3, 4: 9, 5: 10, 8: 4, 9: 6, 10: 7, 11: 8, 12: 11, 13: 12, 14: 13, 15: 14,
};

const W3C_LEFT_TRIGGER = 6;
const W3C_RIGHT_TRIGGER = 7;

const SDL_LEFT_TRIGGER_AXIS = 4;
const SDL_RIGHT_TRIGGER_AXIS = 5;
const SDL_PAD_AXIS_COUNT = 6;
const SDL_PAD_BUTTON_COUNT = 15;

const TOUCH_SLOT_LABEL = 'Touch';

const TOUCH_DEVICE_ENTRY: DeviceEntry = {
  deviceKey: TOUCH_PAD_KEY,
  vendorId: 0,
  productId: 0,
  product: 'Touch controls',
  busType: 'unknown',
  status: 'ready',
  sdlType: 'switch-pro',
  hasButton: Array.from({ length: SDL_PAD_BUTTON_COUNT }, () => true),
  hasAxis: Array.from({ length: SDL_PAD_AXIS_COUNT }, () => true),
  buttonLabels: [],
};

export {
  SDL_LEFT_TRIGGER_AXIS,
  SDL_PAD_AXIS_COUNT,
  SDL_PAD_BUTTON_COUNT,
  SDL_RIGHT_TRIGGER_AXIS,
  TOUCH_DEVICE_ENTRY,
  TOUCH_SLOT_LABEL,
  W3C_LEFT_TRIGGER,
  W3C_RIGHT_TRIGGER,
  W3C_TO_SDL_BUTTON,
};
