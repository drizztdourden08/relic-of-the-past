/* @layer bridge-wasm @kind logic */
import type { DecodeOutcome, ServerMessage } from '@drizztdourden08/archipelia-lobby-protocol';
import { emitEvent } from './emit-event';
import { MESSAGE_HANDLERS } from './message-handlers.constants';
import type { SessionCtx } from './session-context.type';

const dispatch = (ctx: SessionCtx, message: ServerMessage): void => {
  const handler = MESSAGE_HANDLERS[message.type] as (ctx: SessionCtx, message: ServerMessage) => void;
  handler(ctx, message);
};

const routeMessage = (ctx: SessionCtx, outcome: DecodeOutcome): void => {
  if (ctx.finished) return;
  if (!outcome.ok) {
    emitEvent(ctx, { type: 'problem', problem: { code: outcome.failure.code, message: outcome.failure.message } });
    return;
  }
  if (!outcome.known) return;
  const message = outcome.message as ServerMessage;
  if (ctx.uploader?.handle(message) === true) return;
  dispatch(ctx, message);
};

export { routeMessage };
