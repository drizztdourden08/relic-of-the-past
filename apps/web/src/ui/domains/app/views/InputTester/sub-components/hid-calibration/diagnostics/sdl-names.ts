/* @layer renderer-components @kind logic */
/**
 * Reverse lookups over the fixed SDL_BUTTON/SDL_AXIS tables (shared/input):
 * given an index, the positional name at that index (SOUTH, LEFT_SHOULDER, ...).
 */
import { SDL_AXIS, SDL_BUTTON } from '@shared/input/sdl-buttons';
import type { SdlAxisName, SdlButtonName } from '@shared/input/sdl-buttons';

const BUTTON_NAME_BY_INDEX = Object.fromEntries(Object.entries(SDL_BUTTON).map(([name, index]) => [index, name])) as Record<number, SdlButtonName>;
const AXIS_NAME_BY_INDEX = Object.fromEntries(Object.entries(SDL_AXIS).map(([name, index]) => [index, name])) as Record<number, SdlAxisName>;

const sdlButtonNameForIndex = (index: number): string | null => BUTTON_NAME_BY_INDEX[index] ?? null;

const sdlAxisNameForIndex = (index: number): string | null => AXIS_NAME_BY_INDEX[index] ?? null;

export { sdlAxisNameForIndex, sdlButtonNameForIndex };
