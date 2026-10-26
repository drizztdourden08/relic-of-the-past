/* @layer bridge-wasm @kind logic */
import { createUploader } from '../upload/create-uploader';
import { abandonJoin } from './abandon-join';
import { emitEvent } from './emit-event';
import { maybeReady } from './maybe-ready';
import type { SessionCtx } from './session-context.type';

const startUploads = (ctx: SessionCtx): void => {
  const { link } = ctx;
  if (link === null) return;
  ctx.uploader?.cancel();
  ctx.uploader = createUploader({
    link,
    files: ctx.prepared.files,
    chunkBytes: ctx.wire.chunkBytes,
    emit: (event) => emitEvent(ctx, event),
    fail: (problem) => abandonJoin(ctx, problem),
    onIdle: () => maybeReady(ctx),
  });
  ctx.uploader.start(ctx.wire.need);
};

export { startUploads };
