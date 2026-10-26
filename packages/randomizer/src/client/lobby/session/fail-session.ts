/* @layer bridge-wasm @kind logic */
import type { LobbyFailure } from '../failure';
import { emitEvent } from './emit-event';
import { endSession } from './end-session';
import type { SessionCtx } from './session-context.type';

const failSession = (ctx: SessionCtx, failure: LobbyFailure): void => {
  if (ctx.finished) return;
  emitEvent(ctx, { type: 'failed', failure });
  endSession(ctx);
};

export { failSession };
