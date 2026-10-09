/* @layer bridge-wasm @kind logic */
import { attachEngine } from './attach-engine';
import { clearPoll } from './clear-poll';
import { AUDIO_CONTEXT_POLL_MS } from './msu-session.constants';
import { msuSessionState } from './msu-session-state';
import type { MsuSessionOptions } from './msu-session.type';
import { stopMsuSession } from './stop-msu-session';

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
