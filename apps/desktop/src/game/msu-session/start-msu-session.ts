/* @layer bridge-wasm @kind logic */
import { attachEngine } from './attach-engine';
import { clearPoll } from '@rotp/msu';
import { AUDIO_CONTEXT_POLL_MS } from '@rotp/msu';
import { msuSessionState } from '@rotp/msu';
import type { MsuSessionOptions } from '@rotp/msu';
import { stopMsuSession } from '@rotp/msu';

const retryPendingAttach = (): void => {
  const { pending } = msuSessionState;
  if (!pending) {
    clearPoll();
    return;
  }
  if (!attachEngine(pending)) return;
  msuSessionState.pending = null;
  clearPoll();
};

const startMsuSession = (options: MsuSessionOptions): void => {
  stopMsuSession();
  if (attachEngine(options)) return;
  msuSessionState.pending = options;
  clearPoll();
  msuSessionState.pollId = setInterval(retryPendingAttach, AUDIO_CONTEXT_POLL_MS);
};

export { startMsuSession };
