/* @layer shared-input @kind constants */
import { SDL_AXIS, SDL_BUTTON } from '@rotp/game-data';
import type { SdlAxisName, SdlButtonName } from '@rotp/game-data';

const BUTTON_BY_INDEX = new Map<number, SdlButtonName>(
  (Object.keys(SDL_BUTTON) as SdlButtonName[]).map(name => [SDL_BUTTON[name], name]),
);

const AXIS_BY_INDEX = new Map<number, SdlAxisName>(
  (Object.keys(SDL_AXIS) as SdlAxisName[]).map(name => [SDL_AXIS[name], name]),
);

const TRIGGER_AXIS_NAMES: readonly SdlAxisName[] = ['LEFT_TRIGGER', 'RIGHT_TRIGGER'];

const GAMEPLAY_VERBS = ['up', 'down', 'left', 'right', 'pause', 'map'] as const;

export { AXIS_BY_INDEX, BUTTON_BY_INDEX, GAMEPLAY_VERBS, TRIGGER_AXIS_NAMES };
