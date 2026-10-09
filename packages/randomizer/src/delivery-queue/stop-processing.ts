/* @layer bridge-wasm @kind logic */
import { queueState } from './queue-state';

const stopProcessing = (): void => {
  if (queueState.rafId != null) {
    cancelAnimationFrame(queueState.rafId);
    queueState.rafId = null;
  }
};

export { stopProcessing };
