/* @layer renderer-widgets @kind logic */
/**
 * The part of a screen's `spawns` difference a reviewer actually acts on.
 *
 * `SPAWNS_PROBE` (`shared/game/recommendations/strategies/screen/spawns.set.ts`)
 * reports the UNION of the record's own spawns and every live spawn resolved
 * this pass as `diff.liveValue`, so it is always a superset of the record's
 * own list — the interesting part is only the entries the record does not
 * carry yet.
 */
import type { ScreenSpawn } from '@shared/game/data';
import type { Difference } from '@shared/game/recommendations';

/** Stable, order-independent identity for one spawn: which actor, where — mirrors SPAWNS_PROBE's own key. */
const spawnKey = (spawn: ScreenSpawn): string => `${spawn.actorId}@${spawn.tile.x},${spawn.tile.y}`;

/**
 * `diff.liveValue` carries a `ScreenSpawn[]` by `SPAWNS_PROBE`'s own contract,
 * even though the comparison engine types a difference's payload `unknown` —
 * it never inspects one, only compares and formats it.
 */
const liveOnlySpawns = (spawns: readonly ScreenSpawn[], diff: Difference | undefined): readonly ScreenSpawn[] => {
  if (!diff || !Array.isArray(diff.liveValue)) return [];
  const known = new Set(spawns.map(spawnKey));
  return (diff.liveValue as ScreenSpawn[]).filter((spawn) => !known.has(spawnKey(spawn)));
};

export { liveOnlySpawns, spawnKey };
