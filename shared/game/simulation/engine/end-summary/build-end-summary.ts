/* @layer shared-game @kind logic */
import type { DungeonId } from '@rotp/game-data';
import type { EngineState } from '../state/state.type';
import type { EndSummary } from './end-summary.type';
import { MAX_LISTED } from './end-summary.constants';

const buildEndSummary = (state: EngineState): EndSummary => {
  const discovered = new Set<string>([...state.discovered.keys()]);
  for (const exits of state.discovered.values()) for (const e of exits) discovered.add(e.to);

  const neverEntered = [...discovered].filter((id) => !state.everVisited.has(id)).sort();
  let edges = 0;
  for (const exits of state.discovered.values()) edges += exits.length;

  const held: Partial<Record<DungeonId, number>> = {};
  for (const [dungeon, n] of state.keys) if (n > 0) held[dungeon] = n;

  return {
    screens: {
      discovered: discovered.size,
      entered: state.everVisited.size,
      neverEntered: neverEntered.slice(0, MAX_LISTED),
    },
    targets: {
      found: state.done.size + state.failed.size + state.pending.length,
      done: state.done.size,
      failed: state.failed.size,
      stillPending: state.pending.length,
    },
    exits: { edges, leadingNowhereNew: neverEntered.length },
    checks: { verified: state.completedChecks.size },
    keys: { held, bigKeys: [...state.bigKeys].sort() },
  };
};

export { buildEndSummary };
