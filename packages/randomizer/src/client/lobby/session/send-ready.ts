/* @layer bridge-wasm @kind logic */
import { emitEvent } from './emit-event';
import type { SessionCtx } from './session-context.type';

const sendReady = (ctx: SessionCtx, ready: boolean): void => {
  const { link, wire } = ctx;
  if (link === null) return;
  const seq = link.nextSeq();
  wire.readySeq = seq;
  wire.readySent = true;
  link.send({ type: 'ready', seq, ready });
  emitEvent(ctx, { type: 'ready', ready });
};

export { sendReady };
