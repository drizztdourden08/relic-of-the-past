/* @layer bridge-wasm @kind logic */
import { msuSessionState } from './msu-session-state';

const clearPoll = (): void => {
  if (msuSessionState.pollId === null) return;
  clearInterval(msuSessionState.pollId);
  msuSessionState.pollId = null;
};

export { clearPoll };
