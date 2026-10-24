/* @layer bridge-wasm @kind logic */
import { sendReady } from './send-ready';
import type { SessionCtx } from './session-context.type';

const maybeReady = (ctx: SessionCtx): void => {
  const { state, wire, config } = ctx;
  if (config.autoReady === false || wire.readySent || ctx.link === null) return;
  if (!state.uploadsDone || state.admission !== 'approved' || state.ready) return;
  sendReady(ctx, true);
};

export { maybeReady };
