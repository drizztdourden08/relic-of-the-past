/* @layer shared-game @kind logic */
/**
 * What a key requirement token points at.
 *
 * A `smallkey:`/`bigkey:` token either names the dungeon whose key it wants, by
 * `DungeonId`, or carries the wildcard — which is what a connection's
 * `barrier:small-key`/`barrier:big-key` tag turns into, because the tag says a key
 * is needed without saying whose. Keeping the wildcard as its own value (rather
 * than a string that gets looked up in a per-dungeon map and always misses) is
 * what makes the two cases answerable separately.
 */
import type { DungeonId } from '../data';

/** A key requirement that names no particular dungeon: any one will do. */
const ANY_DUNGEON = '*';

type KeyTarget = DungeonId | typeof ANY_DUNGEON;

const isDungeonId = (value: string): value is DungeonId => value.startsWith('dungeon-');

/** The target a key token's suffix names, or null when it names nothing real. */
const keyTargetOf = (suffix: string): KeyTarget | null => {
  if (suffix === ANY_DUNGEON) return ANY_DUNGEON;
  return isDungeonId(suffix) ? suffix : null;
};

export { ANY_DUNGEON, isDungeonId, keyTargetOf };
export type { KeyTarget };
