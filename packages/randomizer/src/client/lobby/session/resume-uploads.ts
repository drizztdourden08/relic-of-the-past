/* @layer bridge-wasm @kind logic */
import type { SessionCtx } from './session-context.type';
import { startUploads } from './start-uploads';

const resumeUploads = (ctx: SessionCtx): void => {
  const { wire } = ctx;
  if (ctx.finished || ctx.link === null || ctx.config.autoUpload === false) return;
  if (!wire.stateSeen || wire.uploadsStarted || wire.awaitingSlots) return;
  wire.uploadsStarted = true;
  startUploads(ctx);
};

export { resumeUploads };
