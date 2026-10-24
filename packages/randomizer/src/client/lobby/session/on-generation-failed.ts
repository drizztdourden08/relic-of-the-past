/* @layer bridge-wasm @kind logic */
import type { LobbyFailed } from '@archipelia/lobby-protocol';
import { emitEvent } from './emit-event';
import type { SessionCtx } from './session-context.type';

const onGenerationFailed = (ctx: SessionCtx, message: LobbyFailed): void => {
  emitEvent(ctx, { type: 'generation-failed', stage: message.stage, message: message.message });
};

export { onGenerationFailed };
