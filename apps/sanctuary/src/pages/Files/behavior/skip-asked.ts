/* @layer sanctuary-site @kind logic */
import { settle } from './settle';
import type { DropQueue, MatchOf } from './drop-queue.type';

const skipAsked = (state: DropQueue, matchOf: MatchOf): DropQueue => settle({ ...state, asking: null }, matchOf);

export { skipAsked };
