/* @layer shared-game @kind data */
/**
 * `screen.spawns` vs the live sprite-spawn table.
 *
 * A `FieldProbe` despite the file name: `SetProbe` is typed over WHOLE entity
 * records, and `spawns` is one array field on a record that already exists.
 * Forcing it through `SetProbe` would make `detector-from-strategy.ts` turn a
 * `missing-in-dataset` difference into a `create`, proposing a SECOND screen
 * record for a room that has one (`direction-tag.detector.ts` hit the same
 * wall). One path compared as a whole array already yields `action: 'update'`.
 *
 * `read` computes the UNION of what the record lists and every live spawn
 * missing from it, never a smaller set: sprites are conditionally spawned and
 * the dataset models that with variant screens, so an unread pass proves nothing
 * about a spawn being IMPOSSIBLE. This is the `removable: false` case made structural.
 */
import { getActorByGameId } from '../../../data';
import type { ActorId, ScreenRecord, ScreenSpawn } from '../../../data/types';
import { known, unread } from '../../compare/probe-helpers';
import type { FieldProbe, Probe } from '../../compare/probe.types';
import type { LiveSpriteObservation, ScreenObservations } from '../../detection-types';
import { isCurrentScreen } from './game-id.probes';

/** Stable, order-independent identity for one spawn: which actor, where. */
const spawnKey = (actorId: ActorId, tile: { x: number; y: number }): string => `${actorId}@${tile.x},${tile.y}`;

/** Every live sprite resolved to a catalogued actor. A sprite type with no
 *  `ActorRecord` is skipped: that gap is `actor-spawns`' finding to report. */
const resolvedLiveSpawns = (liveSprites: readonly LiveSpriteObservation[]): ScreenSpawn[] => {
  const out: ScreenSpawn[] = [];
  for (const sprite of liveSprites) {
    const actor = getActorByGameId({ spriteType: sprite.spriteType });
    if (!actor) continue;
    out.push({ actorId: actor.id, tile: { x: sprite.col, y: sprite.row } });
  }
  return out;
};

/** The record's own spawns, plus any live spawn missing from them. Always a UNION
 *  and never a subset, so an existing catalogued entry is never dropped here. */
const unionSpawns = (current: readonly ScreenSpawn[], liveSprites: readonly LiveSpriteObservation[]): ScreenSpawn[] => {
  const seen = new Set(current.map(spawn => spawnKey(spawn.actorId, spawn.tile)));
  const merged = [...current];
  for (const spawn of resolvedLiveSpawns(liveSprites)) {
    const key = spawnKey(spawn.actorId, spawn.tile);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(spawn);
  }
  return merged;
};

const readSpawns = (observations: ScreenObservations, record: ScreenRecord): Probe<unknown> => {
  const { liveSprites } = observations;
  // Absent means "not read". An unread spawn table proves nothing either way.
  if (!liveSprites) return unread();
  const merged = unionSpawns(record.spawns ?? [], liveSprites);
  // Coalesce an empty union to `undefined`, not `[]`: an empty array is a REAL
  // value, so comparing it against an undefined `record.spawns` would
  // manufacture a "the record has no value" finding.
  return known(merged.length > 0 ? merged : undefined);
};

const SPAWNS_PROBE: FieldProbe<'screen'> = {
  path: 'spawns',
  label: 'Spawns',
  source: 'native:sprite-spawns',
  confidence: 'certain',
  applies: (observations, record) => isCurrentScreen(observations, record),
  read: readSpawns,
};

export { SPAWNS_PROBE };
