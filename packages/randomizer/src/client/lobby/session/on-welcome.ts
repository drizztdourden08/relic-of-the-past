/* @layer bridge-wasm @kind logic */
import type { Welcome } from '@archipelia/lobby-protocol';
import { emitEvent } from './emit-event';
import type { SessionCtx } from './session-context.type';
import { uploadsOf } from './uploads-of';

const onWelcome = (ctx: SessionCtx, message: Welcome): void => {
  const { wire } = ctx;
  ctx.link?.setMaxBytes(message.limits.maxMessageBytes);
  wire.chunkBytes = message.limits.chunkBytes;
  const uploads = uploadsOf(ctx.prepared, message.need);
  wire.need = uploads.map((upload) => upload.sha256);
  ctx.attempts = 0;
  ctx.reconnector.reset();
  emitEvent(ctx, { type: 'welcome', welcome: message, uploads });
};

export { onWelcome };
