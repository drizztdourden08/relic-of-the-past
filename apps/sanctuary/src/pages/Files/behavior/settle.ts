/* @layer sanctuary-site @kind logic */
import type { DropQueue, MatchOf } from './drop-queue.type';

const settle = (state: DropQueue, matchOf: MatchOf): DropQueue => {
  if (state.asking || state.version) return state;
  const batch = [...state.batch];
  for (let i = 0; i < state.queue.length; i += 1) {
    const dropped = state.queue[i];
    const match = matchOf(dropped);
    if (match) return { ...state, queue: state.queue.slice(i + 1), batch, asking: { dropped, match } };
    batch.push(dropped);
  }
  return { ...state, queue: [], batch: [], upload: [...state.upload, ...batch] };
};

export { settle };
