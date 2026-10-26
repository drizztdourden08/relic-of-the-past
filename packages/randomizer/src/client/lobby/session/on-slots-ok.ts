/* @layer bridge-wasm @kind logic */
import type { SlotsOk } from '@drizztdourden08/archipelia-lobby-protocol';
import { emitEvent } from './emit-event';
import type { SessionCtx } from './session-context.type';
import { startUploads } from './start-uploads';
import { uploadsOf } from './uploads-of';

const onSlotsOk = (ctx: SessionCtx, message: SlotsOk): void => {
  const { wire } = ctx;
  ctx.prepared = wire.pendingPrepared ?? ctx.prepared;
  ctx.world = wire.pendingWorld ?? ctx.world;
  wire.pendingPrepared = null;
  wire.pendingWorld = null;
  wire.awaitingSlots = false;
  wire.slotsSeq = null;
  const uploads = uploadsOf(ctx.prepared, message.need);
  wire.need = uploads.map((upload) => upload.sha256);
  emitEvent(ctx, { type: 'slots-ok', uploads });
  wire.uploadsStarted = true;
  if (ctx.config.autoUpload !== false) startUploads(ctx);
};

export { onSlotsOk };
