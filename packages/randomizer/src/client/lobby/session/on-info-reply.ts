/* @layer bridge-wasm @kind logic */
import type { LobbyInfoReply } from '@archipelia/lobby-protocol';
import { emitEvent } from './emit-event';
import { sendHello } from './send-hello';
import type { SessionCtx } from './session-context.type';

const onInfoReply = (ctx: SessionCtx, message: LobbyInfoReply): void => {
  if (ctx.wire.infoSeq === null) return;
  ctx.wire.infoSeq = null;
  const { type: _type, re: _re, ...info } = message;
  emitEvent(ctx, { type: 'info', info });
  sendHello(ctx);
};

export { onInfoReply };
