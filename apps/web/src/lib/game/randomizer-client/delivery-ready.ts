/* @layer bridge-wasm @kind logic */
/**
 * One-shot: calls back once the game can take a server item again, meaning the game is
 * running and the delivery queue has drained. The online client asks for the full received
 * list at that moment, since the list stopped where the game last could not take an item.
 */
import { getGameState, getModule, subscribeGameState } from '../wasm-bridge';
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
