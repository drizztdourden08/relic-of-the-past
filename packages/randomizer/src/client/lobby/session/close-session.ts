/* @layer bridge-wasm @kind logic */
import { emitEvent } from './emit-event';
import { endSession } from './end-session';
import type { SessionCtx } from './session-context.type';

const closeSession = (ctx: SessionCtx): void => {
  if (ctx.finished) return;
  emitEvent(ctx, { type: 'closed', reason: 'caller' });
  endSession(ctx);
};

export { closeSession };
