/* @layer bridge-wasm @kind logic */
import { getGameState, getModule, subscribeGameState } from '@rotp/game-core';
import { size as queueSize, subscribe as subscribeQueue } from '../delivery-queue';

const onDeliveryReady = (listener: () => void): (() => void) => {
  let done = false;
  let running = getGameState().status === 'running';
  let queueIdle = queueSize() === 0;
  const unsubscribes: (() => void)[] = [];
  const dispose = (): void => {
    done = true;
    for (const unsubscribe of unsubscribes) unsubscribe();
  };
  const check = (): void => {
    if (done || !running || !queueIdle || getModule() === null) return;
    dispose();
    listener();
  };
  unsubscribes.push(subscribeGameState((state) => {
    running = state.status === 'running';
    check();
  }));
  unsubscribes.push(subscribeQueue((state) => {
    queueIdle = state.pending.length === 0 && state.delivering === null;
    check();
  }));
  return dispose;
};

export { onDeliveryReady };
