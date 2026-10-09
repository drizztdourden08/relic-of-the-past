/* @layer bridge-wasm @kind logic */
import type { MsuResumeState } from '@shared/types/msu-manifest';
import { msuSessionState } from './msu-session-state';

const msuRestore = (state: MsuResumeState | null): void => {
  msuSessionState.engine?.restore(state);
};

export { msuRestore };
