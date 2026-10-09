/* @layer shared-input @kind data */
const SDL_BUTTON = {
  SOUTH: 0,
  EAST: 1,
  WEST: 2,
  NORTH: 3,
  BACK: 4,
  GUIDE: 5,
  START: 6,
  LEFT_STICK: 7,
  RIGHT_STICK: 8,
  LEFT_SHOULDER: 9,
  RIGHT_SHOULDER: 10,
  DPAD_UP: 11,
  DPAD_DOWN: 12,
  DPAD_LEFT: 13,
  DPAD_RIGHT: 14,
  MISC1: 15,
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
} as const;

const SDL_AXIS = {
  LEFT_X: 0,
  LEFT_Y: 1,
  RIGHT_X: 2,
  RIGHT_Y: 3,
  LEFT_TRIGGER: 4,
  RIGHT_TRIGGER: 5,
} as const;

const SDL_GAMEPAD_TYPES = [
  'unknown', 'standard', 'xbox360', 'xboxone',
  'ps3', 'ps4', 'ps5',
  'switch-pro', 'joycon-left', 'joycon-right', 'joycon-pair',
  'gamecube',
] as const;

export { SDL_BUTTON, SDL_AXIS, SDL_GAMEPAD_TYPES };
