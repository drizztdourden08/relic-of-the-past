/* @layer bridge-wasm @kind logic */
import { reduceLobby } from './reduce-lobby';
import type { LobbyEvent } from './lobby-event.type';
import type { SessionCtx } from './session-context.type';

const emitEvent = (ctx: SessionCtx, event: LobbyEvent): void => {
  ctx.state = reduceLobby(ctx.state, event);
  ctx.listeners.emit(event, ctx.state);
};

export { emitEvent };
