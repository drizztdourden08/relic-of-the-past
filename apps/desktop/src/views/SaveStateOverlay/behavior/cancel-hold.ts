/* @layer renderer-components @kind logic */
import type { ShortcutContext } from '../SaveStateOverlay.type';
import { resetHold } from './reset-hold';

const cancelHold = (ctx: ShortcutContext): void => {
  resetHold(ctx.hold);
  ctx.setHoldProgress(0);
};

export { cancelHold };
