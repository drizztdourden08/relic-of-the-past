/* @layer shared-input @kind constants */
import { SDL_AXIS, SDL_BUTTON } from '@rotp/game-data';
import type { SdlAxisName, SdlButtonName } from './family.type';
import type { OrderedPosition } from './sdl-capabilities.type';

const BUTTON_INDEX: Record<SdlButtonName, number> = {
  ...SDL_BUTTON,
  RIGHT_PADDLE1: 16,
  LEFT_PADDLE1: 17,
  RIGHT_PADDLE2: 18,
  LEFT_PADDLE2: 19,
  TOUCHPAD: 20,
  MISC2: 21,
  MISC3: 22,
  MISC4: 23,
  MISC5: 24,
  MISC6: 25,
};

const AXIS_INDEX: Record<SdlAxisName, number> = SDL_AXIS;

const BUTTON_ORDER: readonly OrderedPosition<SdlButtonName>[] = [
  { position: 'SOUTH', category: 'face' },
  { position: 'EAST', category: 'face' },
  { position: 'WEST', category: 'face' },
  { position: 'NORTH', category: 'face' },
  { position: 'DPAD_UP', category: 'dpad' },
  { position: 'DPAD_DOWN', category: 'dpad' },
  { position: 'DPAD_LEFT', category: 'dpad' },
  { position: 'DPAD_RIGHT', category: 'dpad' },
  { position: 'LEFT_SHOULDER', category: 'shoulder' },
  { position: 'RIGHT_SHOULDER', category: 'shoulder' },
  { position: 'LEFT_PADDLE1', category: 'shoulder' },
  { position: 'LEFT_PADDLE2', category: 'shoulder' },
  { position: 'RIGHT_PADDLE1', category: 'shoulder' },
  { position: 'RIGHT_PADDLE2', category: 'shoulder' },
  { position: 'LEFT_STICK', category: 'stick' },
  { position: 'RIGHT_STICK', category: 'stick' },
  { position: 'BACK', category: 'system' },
  { position: 'GUIDE', category: 'system' },
  { position: 'START', category: 'system' },
  { position: 'MISC1', category: 'system' },
  { position: 'MISC2', category: 'system' },
  { position: 'MISC3', category: 'system' },
  { position: 'MISC4', category: 'system' },
  { position: 'MISC5', category: 'system' },
  { position: 'MISC6', category: 'system' },
  { position: 'TOUCHPAD', category: 'system' },
];

const AXIS_ORDER: readonly OrderedPosition<SdlAxisName>[] = [
  { position: 'LEFT_X', category: 'stick' },
  { position: 'LEFT_Y', category: 'stick' },
  { position: 'RIGHT_X', category: 'stick' },
  { position: 'RIGHT_Y', category: 'stick' },
  { position: 'LEFT_TRIGGER', category: 'trigger' },
  { position: 'RIGHT_TRIGGER', category: 'trigger' },
];

export { AXIS_INDEX, AXIS_ORDER, BUTTON_INDEX, BUTTON_ORDER };
