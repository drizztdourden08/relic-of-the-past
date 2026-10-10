/* @layer renderer-components @kind constants */
import { SDL_AXIS, SDL_BUTTON } from '@rotp/game-data';
import type { SdlAxisName, SdlButtonName } from '@rotp/game-data';

const BUTTON_NAME_BY_INDEX = Object.fromEntries(Object.entries(SDL_BUTTON).map(([name, index]) => [index, name])) as Record<number, SdlButtonName>;
const AXIS_NAME_BY_INDEX = Object.fromEntries(Object.entries(SDL_AXIS).map(([name, index]) => [index, name])) as Record<number, SdlAxisName>;

export { BUTTON_NAME_BY_INDEX, AXIS_NAME_BY_INDEX };
