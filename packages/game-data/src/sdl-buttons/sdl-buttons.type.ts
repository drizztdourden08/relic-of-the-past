/* @layer shared-input @kind types */
import type { SDL_AXIS, SDL_BUTTON, SDL_GAMEPAD_TYPES } from './sdl-buttons.constants';

type SdlButtonName = keyof typeof SDL_BUTTON;
type SdlAxisName = keyof typeof SDL_AXIS;
type SdlGamepadType = (typeof SDL_GAMEPAD_TYPES)[number];

export type { SdlButtonName, SdlAxisName, SdlGamepadType };
