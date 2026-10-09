/* @layer renderer-components @kind logic */
import { ADVANCE_DELAY_MS } from './button-detection.constants';
import type { ButtonCallbacks, ButtonRefs } from './button-detection.type';

const scheduleAdvance = (refs: ButtonRefs, cb: ButtonCallbacks): void => {
  if (refs.advanceTimerRef.current) clearTimeout(refs.advanceTimerRef.current);
  refs.advanceTimerRef.current = setTimeout(() => cb.doAdvance(), ADVANCE_DELAY_MS);
};

export { scheduleAdvance };
