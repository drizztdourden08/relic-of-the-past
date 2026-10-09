/* @layer electron-main @kind constants */
const SOURCE_TREE_RELATIVE = 'electron/input/native/sdl3/prebuilds';

const SDL_BUTTON_NAMES = [
  'SOUTH',
  'EAST',
  'WEST',
  'NORTH',
  'BACK',
  'GUIDE',
  'START',
  'LEFT_STICK',
  'RIGHT_STICK',
  'LEFT_SHOULDER',
  'RIGHT_SHOULDER',
  'DPAD_UP',
  'DPAD_DOWN',
  'DPAD_LEFT',
  'DPAD_RIGHT',
  'MISC1',
  'RIGHT_PADDLE1',
  'LEFT_PADDLE1',
  'RIGHT_PADDLE2',
  'LEFT_PADDLE2',
  'TOUCHPAD',
  'MISC2',
  'MISC3',
  'MISC4',
  'MISC5',
  'MISC6',
] as const;

const SDL_AXIS_NAMES = ['LEFTX', 'LEFTY', 'RIGHTX', 'RIGHTY', 'LEFT_TRIGGER', 'RIGHT_TRIGGER'] as const;

export { SOURCE_TREE_RELATIVE, SDL_AXIS_NAMES, SDL_BUTTON_NAMES };
