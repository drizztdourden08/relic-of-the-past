/* @layer shared-game @kind logic */
/**
 * What a row holds, in ONE order, for every surface that shows one: the tracker's list, its
 * cards, and the toast a check raises as it completes. Each of those used to carry its own
 * copy of this chain in its own order, so the same check could read three ways at once.
 *
 * The order, and why each step comes where it does:
 *
 *  1. an item the caller already resolved (a row expanded to one entry per item);
 *  2. what this run placed there, which outranks everything below it on a seed;
 *  3. what a swap chest holds right now (chest-stand-ins.ts), a fact about the live file;
 *  4. a receipt the surface just saw, for a swap chest the game has this moment paid out;
 *  5. the record's own contents.
 *
 * Step 5 is skipped on an online run: the server hands locations over one at a time, so
 * nothing here knows what this one holds, and the original item is a claim, not an answer.
 */
import type { CheckRecord, ItemId } from '../../data';
import type { RunContext } from './check-grouping/types';

interface ShownItemsParams {
  check: CheckRecord;
  run?: RunContext;
  /** An item that wins outright: a multi-item row already split into one entry per item. */
  override?: ItemId;
  /** What the game just paid at this row, ahead of the record but behind the run's own answer. */
  receipt?: ItemId;
  /** Split a record holding several items into one entry each, when nothing above decided it. */
  expand?: boolean;
}

/** Every item to render for one row, in order; a single undefined entry means "not known here". */
const shownItemsOf = (params: ShownItemsParams): (ItemId | undefined)[] => {
  const { check, run, override, receipt, expand = false } = params;
  if (override !== undefined) return [override];
  const placed = run?.placedItems?.get(check.id);
  if (placed !== undefined) return [placed];
  const live = run?.liveItems?.get(check.id);
  if (live !== undefined) return [live];
  if (receipt !== undefined) return [receipt];
  if (run?.kind === 'online') return [undefined];
  if (expand && check.vanillaItemIds.length > 1) return [...check.vanillaItemIds];
  return [check.vanillaItemIds[0]];
};

/** The one item a row shows, for a surface that never expands a row. */
const shownItemOf = (params: ShownItemsParams): ItemId | undefined =>
  shownItemsOf({ ...params, expand: false })[0];

export { shownItemOf, shownItemsOf };
export type { ShownItemsParams };
