/* @layer sanctuary-site @kind logic */
import { settle } from './settle';
import type { DropQueue, MatchOf } from './drop-queue.type';

const versionDone = (state: DropQueue, matchOf: MatchOf): DropQueue => settle({ ...state, version: null }, matchOf);

export { versionDone };
