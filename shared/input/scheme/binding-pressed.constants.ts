/* @layer shared-input @kind constants */
import { SDL_AXIS } from '@rotp/game-data';

const DEFAULT_AXIS_THRESHOLD = 0.5;
const DEFAULT_TRIGGER_THRESHOLD = 0.9;

const TRIGGER_AXES: readonly number[] = [SDL_AXIS.LEFT_TRIGGER, SDL_AXIS.RIGHT_TRIGGER];

export { DEFAULT_AXIS_THRESHOLD, DEFAULT_TRIGGER_THRESHOLD, TRIGGER_AXES };
