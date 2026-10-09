/* @layer sanctuary-site @kind logic */
import { settle } from './settle';
import type { DropQueue, MatchOf } from './drop-queue.type';

const dropFiles = (state: DropQueue, files: File[], matchOf: MatchOf): DropQueue =>
  settle({ ...state, queue: [...state.queue, ...files] }, matchOf);

export { dropFiles };
