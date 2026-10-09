/* @layer shared-input @kind constants */
import { SDL_AXIS } from './sdl-buttons';
import type { SdlAxisName } from './sdl-buttons';

const AXIS_DIRECTIONS = ['-', '+'] as const;

const AXIS_POSITIONS = Object.keys(SDL_AXIS) as SdlAxisName[];

export { AXIS_DIRECTIONS, AXIS_POSITIONS };
