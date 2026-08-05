/* @layer shared-game @kind data */
/**
 * `screen.spawns` vs the live sprite-spawn table.
 *
 * `ScreenRecord.spawns` is real, authored content (`{actorId, tile}` per
 * static spawn) and `observations.liveSprites` is already observed for the
 * current screen, but nothing compared the two before this.
 *
 * This is a `FieldProbe`, despite the file name matching `presence.set.ts` —
 * a `SetProbe` does not actually fit here. `SetProbe.readDataset`/`datasetKey`
 * are typed over WHOLE entity records of the strategy's own kind
 * (`EntityRecordMap['screen']`): every existing user of the shape (the
 * connection add/remove audit this engine generalizes, and `presence.set.ts`
 * above) compares a collection of POTENTIAL RECORDS against each other. A
 * screen's `spawns` is not a collection of records — it is ONE ARRAY FIELD on
 * a record that already exists — so there is no record-shaped "dataset key"
 * for a single spawn to carry. Forcing it through `SetProbe` would need
 * `toProposed` to hand back a whole patched `ScreenRecord` for a
 * `missing-in-dataset` difference, and `detector-from-strategy.ts` turns
 * every one of those into a `create` — proposing a SECOND screen record for
 * a room that already has one, which is exactly the wrong action. The engine
 * has no vocabulary today for "this collection difference belongs to a
 * record that already exists" — `direction-tag.detector.ts` hit the identical
 * wall for the connection side's own tag-array append and made the same call
 * (stay off the engine; there is no "add one entry" primitive yet). A
 * `FieldProbe` sidesteps the whole problem: one path (`spawns`), compared as
 * a whole array, already produces the correct `action: 'update'` through the
 * existing field-probe path (`draftForField` always emits `update`) with no
 * engine changes at all.
 *
 * The array `read` computes is the UNION of what the record already lists
 * and every live spawn missing from it — never a smaller set — so a
 * catalogued spawn the room does not spawn THIS PASS is never proposed for
 * removal. Sprites are conditionally spawned (progress flags, killed-and-
 * cleared variants), and the dataset already models that with separate
 * variant screens (see `check-presence.ts`'s header for the same call about
 * chests); an unread pass proves nothing about a spawn being IMPOSSIBLE, only
 * that it did not fire this time. This is the `removable: false` case a
 * `SetProbe` would have needed to declare explicitly, made structural instead.
 */
import { getActorByGameId } from '../../../data';
import type { ActorId, ScreenRecord, ScreenSpawn } from '../../../data/types';
import { known, unread } from '../../compare/probe-helpers';
import type { FieldProbe, Probe } from '../../compare/probe.types';
import type { LiveSpriteObservation, ScreenObservations } from '../../detection-types';
import { isCurrentScreen } from './game-id.probes';

/** Stable, order-independent identity for one spawn: which actor, where. */
const spawnKey = (actorId: ActorId, tile: { x: number; y: number }): string => `${actorId}@${tile.x},${tile.y}`;

/**
 * Every live sprite resolved to a catalogued actor, keyed the same way as a
 * `ScreenSpawn`. A sprite type with no `ActorRecord` is skipped: that gap is
 * `actor-spawns`' finding to report, and reporting it again here would
 * double-report the exact same missing catalogue entry under a different name.
 */
const resolvedLiveSpawns = (liveSprites: readonly LiveSpriteObservation[]): ScreenSpawn[] => {
  const out: ScreenSpawn[] = [];
  for (const sprite of liveSprites) {
    const actor = getActorByGameId({ spriteType: sprite.spriteType });
    if (!actor) continue;
    out.push({ actorId: actor.id, tile: { x: sprite.col, y: sprite.row } });
  }
  return out;
};

/** The record's own spawns, plus any live spawn missing from them — a UNION,
 *  never a subset, so an existing catalogued entry is never dropped here. */
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
  // Absent means "not read" — an unread spawn table proves nothing either way.
  if (!liveSprites) return unread();
  const merged = unionSpawns(record.spawns ?? [], liveSprites);
  // Coalesce an empty union to `undefined` (via `known`'s own `?? undefined`)
  // rather than `[]`: an empty array is a REAL value, not an absence, so
  // comparing it against an undefined `record.spawns` would manufacture a
  // "the record has no value" finding out of two sides that both genuinely
  // have nothing to say.
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
