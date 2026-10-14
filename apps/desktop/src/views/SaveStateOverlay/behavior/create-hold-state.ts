/* @layer renderer-components @kind logic */
import type { HoldState } from '../SaveStateOverlay.type';

const createHoldState = (): HoldState => ({ start: null, anim: null, slot: null, complete: false, awaiting: false });

export { createHoldState };
