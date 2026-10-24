/* @layer bridge-wasm @kind logic */
import { sendReady } from './send-ready';
import type { SessionCtx } from './session-context.type';

const retryReady = (ctx: SessionCtx, re: number | undefined): void => {
  const { wire } = ctx;
  if (re === undefined || re !== wire.readySeq || wire.readyRetried) return;
  wire.readyRetried = true;
  sendReady(ctx, ctx.state.ready);
};

export { retryReady };
