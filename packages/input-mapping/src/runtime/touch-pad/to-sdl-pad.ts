/* @layer shared-input @kind logic */
import type { PadState } from '../../touch/touch-logic.type';
import {
  SDL_LEFT_TRIGGER_AXIS,
  SDL_PAD_AXIS_COUNT,
  SDL_PAD_BUTTON_COUNT,
  SDL_RIGHT_TRIGGER_AXIS,
  W3C_LEFT_TRIGGER,
  W3C_RIGHT_TRIGGER,
  W3C_TO_SDL_BUTTON,
} from './touch-pad.constants';

/** Re-index a W3C standard pad into the SDL layout every physical pad reaches the game in. */
const toSdlPad = (pad: PadState): { buttons: boolean[]; axes: number[] } => {
  const buttons = Array.from({ length: SDL_PAD_BUTTON_COUNT }, () => false);
  for (const [w3c, sdl] of Object.entries(W3C_TO_SDL_BUTTON)) {
    buttons[sdl] = pad.buttons[Number(w3c)] === true;
  }
  const axes = Array.from({ length: SDL_PAD_AXIS_COUNT }, (_, i) => pad.axes[i] ?? 0);
  axes[SDL_LEFT_TRIGGER_AXIS] = pad.buttons[W3C_LEFT_TRIGGER] === true ? 1 : 0;
  axes[SDL_RIGHT_TRIGGER_AXIS] = pad.buttons[W3C_RIGHT_TRIGGER] === true ? 1 : 0;
  return { buttons, axes };
};

export { toSdlPad };
