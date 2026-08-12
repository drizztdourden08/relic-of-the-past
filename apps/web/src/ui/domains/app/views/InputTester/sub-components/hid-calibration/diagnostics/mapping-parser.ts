/* @layer renderer-components @kind logic */
/**
 * Parses an SDL gamecontrollerdb mapping line into lookup tables from a raw
 * joystick-level control (button index, hat index+mask, axis index) back to
 * the SDL gamepad key it's bound to: the inverse of what the mapping string
 * itself expresses. Used to attach a positional SDL name to a joystick-level
 * observation when the device has no live gamepad-state stream of its own.
 */

/** Mapping-string key, in the same fixed order as SDL_BUTTON in shared/input/sdl-buttons.ts. */
const BUTTON_KEYS = [
  'a', 'b', 'x', 'y', 'back', 'guide', 'start', 'leftstick', 'rightstick',
  'leftshoulder', 'rightshoulder', 'dpup', 'dpdown', 'dpleft', 'dpright', 'misc1',
] as const;

/** Mapping-string key, in the same fixed order as SDL_AXIS in shared/input/sdl-buttons.ts. */
const AXIS_KEYS = ['leftx', 'lefty', 'rightx', 'righty', 'lefttrigger', 'righttrigger'] as const;

interface ParsedMapping {
  guid: string;
  name: string;
  /** Joystick button index -> mapping-string key ('a', 'leftshoulder', ...). */
  buttonIndexToKey: Map<number, string>;
  /** `"${hatIndex}.${bitMask}"` -> mapping-string key (dpup/dpdown/dpleft/dpright). */
  hatToKey: Map<string, string>;
  /** Joystick axis index -> mapping-string key ('leftx', 'lefttrigger', ...). */
  axisIndexToKey: Map<number, string>;
}

/** Strips a value token's direction/inversion prefix (`~`, `+`, `-`). This
 *  parser only needs which control fired, not which half of it. */
const stripDirection = (value: string): string => value.replace(/^[~+-]/, '');

const parseGamepadMapping = (mapping: string): ParsedMapping | null => {
  const parts = mapping.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const [guid, name, ...fields] = parts;
  const buttonIndexToKey = new Map<number, string>();
  const hatToKey = new Map<string, string>();
  const axisIndexToKey = new Map<number, string>();

  for (const field of fields) {
    const [key, rawValue] = field.split(':');
    if (!key || !rawValue) continue;
    const value = stripDirection(rawValue);
    if (value.startsWith('b')) {
      const index = Number(value.slice(1));
      if (Number.isFinite(index)) buttonIndexToKey.set(index, key);
    } else if (value.startsWith('h')) {
      const [hatIndex, hatMask] = value.slice(1).split('.');
      if (hatIndex !== undefined && hatMask !== undefined) hatToKey.set(`${hatIndex}.${hatMask}`, key);
    } else if (value.startsWith('a')) {
      const index = Number(value.slice(1));
      if (Number.isFinite(index)) axisIndexToKey.set(index, key);
    }
  }

  return { guid, name, buttonIndexToKey, hatToKey, axisIndexToKey };
};

/** The fixed SDL_GamepadButton index for a mapping-string button key, or -1 when the key isn't one of the fixed buttons. */
const sdlButtonIndexForKey = (key: string): number => BUTTON_KEYS.indexOf(key as (typeof BUTTON_KEYS)[number]);

/** The fixed SDL_GamepadAxis index for a mapping-string axis key, or -1 when the key isn't one of the fixed axes. */
const sdlAxisIndexForKey = (key: string): number => AXIS_KEYS.indexOf(key as (typeof AXIS_KEYS)[number]);

export { parseGamepadMapping, sdlAxisIndexForKey, sdlButtonIndexForKey };
export type { ParsedMapping };
