/* @layer bridge-wasm @kind logic */
import type { LobbyState } from '@drizztdourden08/archipelia-lobby-protocol';
import { emitEvent } from './emit-event';
import { maybeReady } from './maybe-ready';
import { resumeUploads } from './resume-uploads';
import type { SessionCtx } from './session-context.type';

const onLobbyState = (ctx: SessionCtx, message: LobbyState): void => {
  ctx.wire.stateSeen = true;
  emitEvent(ctx, { type: 'lobby-state', lobbyState: message });
  resumeUploads(ctx);
  maybeReady(ctx);
};

export { onLobbyState };
