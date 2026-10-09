/* @layer sanctuary-site @kind logic */
import type { DropQueue } from './drop-queue.type';

const asVersion = (state: DropQueue): DropQueue =>
  (state.asking ? { ...state, asking: null, version: { file: state.asking.match, dropped: state.asking.dropped } } : state);

export { asVersion };
