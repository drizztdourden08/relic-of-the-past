/* @layer bridge-wasm @kind logic */
import { emitEvent } from './emit-event';
import { endSession } from './end-session';
import { sendLeave } from './send-leave';
import type { SessionCtx } from './session-context.type';

const leaveSession = (ctx: SessionCtx): void => {
  if (ctx.finished) return;
  sendLeave(ctx);
  emitEvent(ctx, { type: 'closed', reason: 'left' });
  endSession(ctx);
};

export { leaveSession };
