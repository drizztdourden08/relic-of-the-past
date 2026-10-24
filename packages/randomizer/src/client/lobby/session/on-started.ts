/* @layer bridge-wasm @kind logic */
import type { LobbyStarted } from '@archipelia/lobby-protocol';
import { emitEvent } from './emit-event';
import type { SessionCtx } from './session-context.type';

const onStarted = (ctx: SessionCtx, message: LobbyStarted): void => {
  const { seed, engine, room, slots } = message;
  emitEvent(ctx, { type: 'started', started: { seed, engine, room, slots } });
};

export { onStarted };
