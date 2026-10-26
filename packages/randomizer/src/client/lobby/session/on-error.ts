/* @layer bridge-wasm @kind logic */
import type { ErrorMessage } from '@drizztdourden08/archipelia-lobby-protocol';
import { failureOfError, problemOfError } from '../failure';
import { emitEvent } from './emit-event';
import { endSession } from './end-session';
import { failSession } from './fail-session';
import { retryReady } from './retry-ready';
import type { SessionCtx } from './session-context.type';
import { resumeUploads } from './resume-uploads';

const onFatal = (ctx: SessionCtx, message: ErrorMessage): void => {
  if (message.code === 'refused') {
    emitEvent(ctx, { type: 'admission', state: 'refused', reason: message.message });
    endSession(ctx);
    return;
  }
  failSession(ctx, failureOfError(message));
};

const rejectDownload = (ctx: SessionCtx, re: number | undefined, text: string): boolean => {
  const download = re === undefined ? undefined : ctx.downloads.get(re);
  if (re === undefined || download === undefined) return false;
  ctx.downloads.delete(re);
  download.reject(new Error(text));
  return true;
};

const onError = (ctx: SessionCtx, message: ErrorMessage): void => {
  if (message.fatal) {
    onFatal(ctx, message);
    return;
  }
  if (rejectDownload(ctx, message.re, message.message)) return;
  if (message.re !== undefined && message.re === ctx.wire.slotsSeq) {
    ctx.wire.awaitingSlots = false;
    ctx.wire.slotsSeq = null;
  }
  emitEvent(ctx, { type: 'problem', problem: problemOfError(message) });
  retryReady(ctx, message.re);
  resumeUploads(ctx);
};

export { onError };
