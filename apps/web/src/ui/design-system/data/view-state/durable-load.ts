/* @layer renderer-components @kind logic */
/**
 * Reading a saved layout back is asynchronous, and the user does not wait for
 * it. Between the moment a view asks for its snapshot and the moment the answer
 * arrives, the user can already have rearranged that view, say by clearing the
 * filter clauses one by one. The answer describes the view as it stood BEFORE
 * any of that, and must never land on top of it.
 *
 * The rule is a generation counter, not a timestamp or a deep compare:
 * a load opens a generation, a local write retires it, and a result may only be
 * applied while the generation it opened in is still current and unwritten.
 * Everything that has to lose the race loses it the same way. A superseded key,
 * a view that went away, and a user edit are all a result that arrived too late.
 *
 * The reader is injected, not imported, so this stays headless like the
 * rest of the package; binding it to real storage is the hook's job.
 */
import type { SchemaLike } from '../schema/build-schema';
import type { TableColumn } from '../table/types';
import type { FilterClause } from '../filter/clause';
import { prune } from './prune';
import { emptySnapshot } from './snapshot';
import type { ViewSnapshot } from './snapshot';

interface LoadGuard {
  /** Opens a generation for a load about to start; hand the token back on resolve. */
  begin: () => number;
  /** Closes the open generation without opening another, for when the view went away. */
  cancel: () => void;
  /** Records a local write, which retires every load still in flight. */
  markEdited: () => void;
  /** True only while `token`'s generation is still the current, unwritten one. */
  mayApply: (token: number) => boolean;
}

/** One per view binding: nothing is shared between two views, or two hook instances. */
const createLoadGuard = (): LoadGuard => {
  let generation = 0;
  let edited = false;

  const begin = (): number => {
    generation += 1;
    edited = false;
    return generation;
  };

  return {
    begin,
    cancel: () => { generation += 1; },
    markEdited: () => { edited = true; },
    mayApply: (token: number) => token === generation && !edited,
  };
};

const emptySnapshotFor = (
  fallbackColumns: readonly TableColumn[],
  fallbackGroupBy?: readonly string[],
): ViewSnapshot => ({
  ...emptySnapshot(),
  columns: fallbackColumns.map((column) => ({ ...column })),
  groupBy: fallbackGroupBy ? [...fallbackGroupBy] : [],
});

/**
 * A clause id must be unique within its own list, because FilterBar's
 * add/remove/update all key off it (see FilterBar.tsx). A disk file written
 * before clause ids were switched to `crypto.randomUUID()` (see filter/clause.ts)
 * can still carry two clauses that collided under the old per-session counter. Reassigning a
 * fresh id to every repeat occurrence heals that file in place, the first time
 * it is loaded, without dropping the clause outright.
 */
const dedupeClauseIds = (clauses: readonly FilterClause[]): readonly FilterClause[] => {
  const seen = new Set<string>();
  return clauses.map((clause) => {
    if (!seen.has(clause.id)) {
      seen.add(clause.id);
      return clause;
    }
    const id = crypto.randomUUID();
    seen.add(id);
    return { ...clause, id };
  });
};

/**
 * Prunes a durably-loaded snapshot against the CURRENT schema, never trusting
 * stale paths, and falls back to `fallbackColumns` when nothing survived
 * (including when there was nothing to load at all).
 *
 * `fallbackGroupBy` applies only to the "nothing to load" case, deliberately:
 * a view the user has arranged already said what it wants, and a saved layout
 * with no grouping is an answer, not an absence.
 */
const restoreDurableSnapshot = (
  loaded: ViewSnapshot | undefined,
  schema: SchemaLike,
  fallbackColumns: readonly TableColumn[],
  fallbackGroupBy?: readonly string[],
): ViewSnapshot => {
  const base = loaded ?? emptySnapshotFor(fallbackColumns, fallbackGroupBy);
  const pruned = prune(base, schema, fallbackColumns);
  return { ...pruned, filters: dedupeClauseIds(pruned.filters) };
};

interface DurableLoadParams {
  guard: LoadGuard;
  /** Reads this view's saved snapshot, or resolves undefined when it has none. */
  load: () => Promise<ViewSnapshot | undefined>;
  schema: SchemaLike;
  fallbackColumns: readonly TableColumn[];
  /** Grouping to open with when this view has nothing saved. */
  fallbackGroupBy?: readonly string[];
  apply: (snapshot: ViewSnapshot) => void;
}

/** Starts a read and applies its result only if it is still the state the user is looking at. */
const beginDurableLoad = (params: DurableLoadParams): void => {
  const { guard, load, schema, fallbackColumns, fallbackGroupBy, apply } = params;
  const token = guard.begin();
  void load().then((loaded) => {
    if (!guard.mayApply(token)) return;
    apply(restoreDurableSnapshot(loaded, schema, fallbackColumns, fallbackGroupBy));
  });
};

export {
  beginDurableLoad, createLoadGuard, dedupeClauseIds, emptySnapshotFor, restoreDurableSnapshot,
};
export type { DurableLoadParams, LoadGuard };
