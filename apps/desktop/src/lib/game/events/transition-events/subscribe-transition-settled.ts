/* @layer bridge-wasm @kind logic */
import type { TransitionListener } from '../transition-events.type';
import { transitionListeners } from './transition-listeners';

const subscribeTransitionSettled = (listener: TransitionListener): (() => void) => {
  transitionListeners.add(listener);
  return () => { transitionListeners.delete(listener); };
};

export { subscribeTransitionSettled };
