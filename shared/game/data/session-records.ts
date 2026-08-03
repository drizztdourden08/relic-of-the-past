/* @layer shared-game @kind logic */
/**
 * Folding a write back into the live session, for every collection whose only
 * store is the registry itself.
 *
 * Tag and item group each keep their own lookup maps beside the registry, so
 * each owns its fold-back (tags/lookup.ts, item-groups/lookup.ts) and has to.
 * The other kinds keep nothing else: the registry map IS the collection, plus
 * the gameId indexes derived from it. So one set of generic helpers covers them
 * all, and a kind wired up later needs nothing new here.
 *
 * All three run AFTER the write they depend on has landed on disk — this only
 * saves the session from reading a record it just changed as it stood at seed
 * time. The gameId indexes are rebuilt either way: a record whose native values
 * moved (or that is gone entirely) would otherwise keep answering a reverse
 * lookup out of the old table.
 *
 * The record is taken as `{ id: string }` rather than as the kind's own type.
 * These are session bookkeeping, called from an editor that holds a row, not a
 * typed record; pairing the two at the call site would only add a cast there
 * instead of here, and the store is keyed by id either way.
 */
import { rebuild } from './indexes';
import { all, replaceAll } from './registry';
import type { EntityKind, EntityOf } from './types';

type AnyRecord = { id: string };

const idOf = (record: unknown): string => (record as AnyRecord).id;

const commit = (kind: EntityKind, records: readonly unknown[]): void => {
  replaceAll(kind, records as readonly EntityOf<EntityKind>[]);
  rebuild();
};

/** Swaps an edited record in place. False when the id is not registered. */
const replaceRecord = (kind: EntityKind, record: AnyRecord): boolean => {
  const held: readonly unknown[] = all(kind);
  if (!held.some(entry => idOf(entry) === record.id)) return false;
  commit(kind, held.map(entry => (idOf(entry) === record.id ? record : entry)));
  return true;
};

/** Adds a record the allocator minted after seeding. False when the id is taken. */
const registerRecord = (kind: EntityKind, record: AnyRecord): boolean => {
  const held: readonly unknown[] = all(kind);
  if (held.some(entry => idOf(entry) === record.id)) return false;
  commit(kind, [...held, record]);
  return true;
};

/** Drops a record the delete-guard has already removed from disk. */
const unregisterRecord = (kind: EntityKind, id: string): boolean => {
  const held: readonly unknown[] = all(kind);
  const next = held.filter(entry => idOf(entry) !== id);
  if (next.length === held.length) return false;
  commit(kind, next);
  return true;
};

export { registerRecord, replaceRecord, unregisterRecord };
