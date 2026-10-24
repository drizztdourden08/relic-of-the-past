/* @layer renderer-lib @kind constants */
import type { InputIconFamily } from '@drizztdourden08/tessera/primitives';

const GLYPH_FAMILY: Readonly<Record<string, InputIconFamily>> = {
  xbox: 'xbox', ps: 'playstation', switch: 'switch', gc: 'gamecube', snes: 'snes', generic: 'generic',
};

const GENERIC_GLYPH_NAMES: Readonly<Record<string, string>> = {
  btn: 'button', 'btn-circle': 'button-circle', 'trigger-a': 'button-trigger-a', 'trigger-b': 'button-trigger-b',
};

const SDL_BUTTON_IDS: Readonly<Record<string, string>> = {
  SOUTH: 'a', EAST: 'b', WEST: 'x', NORTH: 'y', DPAD_UP: 'dpup', DPAD_DOWN: 'dpdown', DPAD_LEFT: 'dpleft', DPAD_RIGHT: 'dpright',
};

const FALLBACK_ICON_FAMILY: InputIconFamily = 'generic';

export { FALLBACK_ICON_FAMILY, GENERIC_GLYPH_NAMES, GLYPH_FAMILY, SDL_BUTTON_IDS };
