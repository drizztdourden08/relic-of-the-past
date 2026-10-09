/* @layer bridge-wasm @kind logic */
import type { TransitionListener } from '../transition-events.type';

const transitionListeners = new Set<TransitionListener>();

export { transitionListeners };
