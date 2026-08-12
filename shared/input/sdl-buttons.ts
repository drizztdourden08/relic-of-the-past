/* @layer shared-input @kind data */
/**
 * Canonical button indices for the input layer.
 *
 * Every preset's default bindings index into the button array the native input
 * layer emits, and that array is positional: index 4 means the same physical
 * place on every pad, whatever the vendor prints on it. Naming the indices here
 * keeps presets readable and, more importantly, keeps them honest. The previous
 * scheme used bare numbers inherited from two different sources (the browser
 * gamepad ordering for some pads, a per-device byte layout for others), and
 * those numbers silently meant different buttons once the source changed.
 *
 * Positional, not lettered: SOUTH is the bottom face button, EAST the right one,
 * and so on. On one vendor's pad the bottom button is labelled A, on another it
 * is labelled B. Bind by position and both land in the right place.
 */

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

/**
 * Trigger axes. Triggers are analog and arrive as axes, not buttons, so a
 * preset binding a trigger uses these rather than a SDL_BUTTON entry.
 */
const SDL_AXIS = {
  LEFT_X: 0,
  LEFT_Y: 1,
  RIGHT_X: 2,
  RIGHT_Y: 3,
  LEFT_TRIGGER: 4,
  RIGHT_TRIGGER: 5,
} as const;

/**
 * The families the input layer reports, straight from SDL. Declared here with
 * the positions so there is one place that says what a controller can be, and
 * nothing downstream can drift from it.
 */
const SDL_GAMEPAD_TYPES = [
  'unknown', 'standard', 'xbox360', 'xboxone',
  'ps3', 'ps4', 'ps5',
  'switch-pro', 'joycon-left', 'joycon-right', 'joycon-pair',
  'gamecube',
] as const;

type SdlButtonName = keyof typeof SDL_BUTTON;
type SdlAxisName = keyof typeof SDL_AXIS;
type SdlGamepadType = (typeof SDL_GAMEPAD_TYPES)[number];

export { SDL_BUTTON, SDL_AXIS, SDL_GAMEPAD_TYPES };
export type { SdlButtonName, SdlAxisName, SdlGamepadType };
