/* @layer shared-game @kind logic */
/**
 * What the run FOUND versus what it resolved.
 *
 * `not-completable` on its own is a verdict, not a report. It says the frontier
 * emptied but nothing about whether that was correct. This counts everything
 * discovery saw and how much of it was actually dealt with, so a run that stops
 * early can be told apart from one that exhausted its reach, and so a
 * blocked chest or an unentered room is visible instead of merely absent.
 */
import type { DungeonId } from '../../data';
import type { EngineState } from './state';

interface EndSummary {
  screens: { discovered: number; entered: number; neverEntered: string[] };
  targets: { found: number; done: number; failed: number; stillPending: number };
  /** Edges the graph knows versus screens they lead to that were never entered. */
  exits: { edges: number; leadingNowhereNew: number };
  checks: { verified: number };
  keys: { held: Partial<Record<DungeonId, number>>; bigKeys: DungeonId[] };
}

/** Cap the listing, since a run that entered nothing should not print a novel. */
const MAX_LISTED = 40;

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

/** One-line-per-fact rendering for the run log. */
const formatEndSummary = (s: EndSummary): string[] => [
  `screens  ${s.screens.discovered} discovered / ${s.screens.entered} entered / ${s.exits.leadingNowhereNew} never entered`,
  `targets  ${s.targets.found} found / ${s.targets.done} done / ${s.targets.failed} failed / ${s.targets.stillPending} still pending`,
  `checks   ${s.checks.verified} verified`,
  `keys     ${Object.entries(s.keys.held).map(([d, n]) => `${d}x${n}`).join(' ') || 'none'}${s.keys.bigKeys.length ? ` · big: ${s.keys.bigKeys.join(' ')}` : ''}`,
  `edges    ${s.exits.edges} in the discovered graph`,
];

export { buildEndSummary, formatEndSummary };
export type { EndSummary };
