/* @layer shared-input @kind logic */
import { SDL_AXIS, SDL_BUTTON } from '../sdl-buttons';
import { DEFAULT_TRIGGER_PRESS_THRESHOLD } from './live-control-state.constants';
import type { ResolvedControl } from './family.type';
import type { LiveControlState } from './live-control-state.type';

const resolveLiveControlState = (
  control: ResolvedControl,
  buttonsLive: readonly boolean[],
  axesLive: readonly number[],
): LiveControlState => {
  if (control.kind === 'axis') {
    const index = SDL_AXIS[control.position as keyof typeof SDL_AXIS];
    const value = axesLive[index] ?? 0;
    const threshold = control.pressThreshold ?? DEFAULT_TRIGGER_PRESS_THRESHOLD;
    return { value, pressed: value >= threshold };
  }
  const index = SDL_BUTTON[control.position as keyof typeof SDL_BUTTON];
  const pressed = buttonsLive[index] ?? false;
  return { value: pressed ? 1 : 0, pressed };
};

export { resolveLiveControlState };
