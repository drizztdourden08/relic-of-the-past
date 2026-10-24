/* @layer bridge-wasm @kind logic */
import type { AdmissionMessage } from '@drizztdourden08/archipelia-lobby-protocol';
import { emitEvent } from './emit-event';
import { endSession } from './end-session';
import { maybeReady } from './maybe-ready';
import type { SessionCtx } from './session-context.type';

const onAdmission = (ctx: SessionCtx, message: AdmissionMessage): void => {
  emitEvent(ctx, { type: 'admission', state: message.state, reason: message.reason ?? null });
  if (message.state === 'refused' || message.state === 'removed') endSession(ctx);
  else maybeReady(ctx);
};

export { onAdmission };
