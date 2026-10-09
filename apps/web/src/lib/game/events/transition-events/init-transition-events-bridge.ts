/* @layer bridge-wasm @kind logic */
import { classifyTransition } from '../classify-transition';
import type { TransitionSettled } from '../transition-events.type';
import { transitionListeners } from './transition-listeners';

const onTransitionSettled = (
  module: number, fromSubmodule: number, indoors: number, roomIndex: number, owScreenIndex: number,
): void => {
  const event: TransitionSettled = {
    kind: classifyTransition(module, fromSubmodule),
    module,
    fromSubmodule,
    isIndoors: indoors === 1,
    roomIndex,
    owScreenIndex,
  };
  for (const listener of transitionListeners) {
    try { listener(event); } catch { continue; }
  }
};

const initTransitionEventsBridge = (): void => {
  Object.assign(window, { __onTransitionSettled: onTransitionSettled });
};

export { initTransitionEventsBridge };
