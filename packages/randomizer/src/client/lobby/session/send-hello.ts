/* @layer bridge-wasm @kind logic */
import { buildHello } from '../join/build-hello';
import type { SessionCtx } from './session-context.type';

const sendHello = (ctx: SessionCtx): void => {
  const { link } = ctx;
  if (link === null) return;
  link.send(buildHello(ctx.config, ctx.prepared, ctx.state.token, link.nextSeq()));
};

export { sendHello };
