/* @layer bridge-wasm @kind logic */
import { queueState } from '@rotp/randomizer';
import { tick } from './tick';

const startProcessing = (): void => {
  if (queueState.rafId != null) return;
  queueState.rafId = requestAnimationFrame(tick);
};

export { startProcessing };
