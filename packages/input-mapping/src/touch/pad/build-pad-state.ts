/* @layer shared-input @kind logic */
import type { TouchEmit } from '@rotp/features';
import { EMIT_TO_PAD_INDEX, TOUCH_PAD_BUTTON_COUNT } from '../touch-emit.constants';
import type { PadState } from '../touch-logic.type';

const buildPadState = (pressed: ReadonlySet<TouchEmit>, stick: [number, number] | null): PadState => {
  const buttons = new Array<boolean>(TOUCH_PAD_BUTTON_COUNT).fill(false);
  for (const emit of pressed) buttons[EMIT_TO_PAD_INDEX[emit]] = true;
  return { buttons, axes: [stick ? stick[0] : 0, stick ? stick[1] : 0, 0, 0] };
};

export { buildPadState };
