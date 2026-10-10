/* @layer sanctuary-site @kind logic */
import type { DropQueue, MatchOf } from './drop-queue.type';

const settle = (state: DropQueue, matchOf: MatchOf): DropQueue => {
  if (state.asking || state.version) return state;
  const batch = [...state.batch];
  for (const [i, dropped] of state.queue.entries()) {
    const match = matchOf(dropped);
    if (match) return { ...state, queue: state.queue.slice(i + 1), batch, asking: { dropped, match } };
    batch.push(dropped);
  }
  return { ...state, queue: [], batch: [], upload: [...state.upload, ...batch] };
};

export { settle };
