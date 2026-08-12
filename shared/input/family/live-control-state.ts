/* @layer shared-input @kind logic */
/**
 * Combines a static ResolvedControl with a live buttons/axes sample to
 * answer the two questions every control needs answered uniformly: its
 * current analog value, and whether it counts as pressed right now. A
 * trigger SDL reports as an axis derives both from the same analog reading
 * (the value itself, and pressed via the control's own threshold); a
 * trigger, or any other control, SDL reports only as a button has no analog
 * reading at all, so pressed is the button state directly and the value
 * just mirrors it as 0 or 1. A caller never special-cases a trigger.
 */
import { SDL_AXIS, SDL_BUTTON } from '../sdl-buttons';
import type { ResolvedControl } from './family.type';

/** Used when neither an override nor a family sets ResolvedControl.pressThreshold.
 *  High on purpose: a trigger only reads as pressed near the end of its
 *  travel, the same "fully pressed" feel the Standard Gamepad API gives a
 *  trigger button for free. */
const DEFAULT_TRIGGER_PRESS_THRESHOLD = 0.9;

interface LiveControlState {
  readonly value: number;
  readonly pressed: boolean;
}

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

export { DEFAULT_TRIGGER_PRESS_THRESHOLD, resolveLiveControlState };
export type { LiveControlState };
