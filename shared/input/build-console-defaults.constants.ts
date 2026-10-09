/* @layer shared-input @kind constants */
import { SDL_AXIS } from '@rotp/game-data';
import type { SdlAxisName } from '@rotp/game-data';

const AXIS_DIRECTIONS = ['-', '+'] as const;

const AXIS_POSITIONS = Object.keys(SDL_AXIS) as SdlAxisName[];

export { AXIS_DIRECTIONS, AXIS_POSITIONS };
