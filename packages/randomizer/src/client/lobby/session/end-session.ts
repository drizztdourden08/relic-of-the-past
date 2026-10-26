/* @layer bridge-wasm @kind logic */
import type { SessionCtx } from './session-context.type';

const endSession = (ctx: SessionCtx): void => {
  if (ctx.finished) return;
  ctx.finished = true;
  ctx.uploader?.cancel();
  ctx.uploader = null;
  ctx.reconnector.cancel();
  for (const download of ctx.downloads.values()) download.reject(new Error('The lobby session ended.'));
  ctx.downloads.clear();
  const { link } = ctx;
  ctx.link = null;
  link?.close();
  ctx.settle(ctx.state);
};

export { endSession };
