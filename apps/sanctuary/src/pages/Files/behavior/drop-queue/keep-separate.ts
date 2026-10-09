/* @layer sanctuary-site @kind logic */
import { settle } from './settle';
import type { DropQueue, MatchOf } from './drop-queue.type';

const keepSeparate = (state: DropQueue, matchOf: MatchOf): DropQueue =>
  (state.asking ? settle({ ...state, batch: [...state.batch, state.asking.dropped], asking: null }, matchOf) : state);

export { keepSeparate };
