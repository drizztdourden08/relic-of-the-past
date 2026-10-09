/* @layer bridge-wasm @kind logic */
import { queueState } from '@rotp/randomizer';
import { tickFrontEntry } from './tick-front-entry';
import { tickInFlight } from './tick-in-flight';

const tick = (): void => {
  queueState.rafId = requestAnimationFrame(tick);

  if (queueState.cooldownFrames > 0) {
    queueState.cooldownFrames--;
    return;
  }

  if (queueState.delivering) {
    tickInFlight(queueState.delivering);
    return;
  }

  tickFrontEntry();
};

export { tick };
