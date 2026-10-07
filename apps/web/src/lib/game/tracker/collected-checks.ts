/* @layer bridge-wasm @kind logic */
/**
 * Checks the multiworld room holds as done while the save does not: a location collected for
 * this slot by `!collect`, or checked in another session of the same slot. The tracker shows
 * them completed, as the room does. The game's own completion flags are never written: this
 * is the app's view alone, and it goes with the online session.
 */
import type { CheckId } from '@shared/game/data';

let collected = new Set<CheckId>();

/** Adds |ids|; true when any of them was new. */
const addCollectedChecks = (ids: Iterable<CheckId>): boolean => {
  const before = collected.size;
  const next = new Set(collected);
  for (const id of ids) next.add(id);
  collected = next;
  return collected.size !== before;
};

const clearCollectedChecks = (): void => {
  collected = new Set();
};

/** The completed set the save shows, with every collected check added to it. */
const withCollectedChecks = (completed: Set<CheckId>): Set<CheckId> => {
  for (const id of collected) completed.add(id);
  return completed;
};

export { addCollectedChecks, clearCollectedChecks, withCollectedChecks };
