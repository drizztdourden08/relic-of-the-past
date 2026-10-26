/* @layer bridge-wasm @kind logic */
import type { LobbyProgress } from '@drizztdourden08/archipelia-lobby-protocol';
import { emitEvent } from './emit-event';
import type { SessionCtx } from './session-context.type';

const onProgress = (ctx: SessionCtx, message: LobbyProgress): void => {
  const { phase, step, fraction } = message;
  emitEvent(ctx, { type: 'progress', progress: { phase, step, fraction } });
};

export { onProgress };
