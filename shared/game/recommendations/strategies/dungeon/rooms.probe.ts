/* @layer shared-game @kind data */
/**
 * `DungeonRecord.roomScreenIds` vs. the currently loaded room — an APPEND
 * fix, not a replace, so this follows the precedent `strategies/screen/
 * spawns.set.ts` already set for the same shape of problem: expressed as a
 * `FieldProbe` whose `read` returns the UNION of the record's existing list
 * and the current screen, never a smaller set, so an already-catalogued
 * member is never dropped. See that file's own header for why a `SetProbe`
 * does not fit an append onto a single array FIELD of a record that already
 * exists (a `missing-in-dataset` `SetProbe` finding always becomes a
 * `create`, which is the wrong action for a record that is already there).
 *
 * Room-to-dungeon membership is a native, enumerable fact about the loaded
 * room — `cur_palace_index_x2` names the dungeon outright — so a missing
 * entry is proven, never inferred: `certain`.
 *
 * The live value is the CURRENT screen's id, which (like `strategies/check/
 * corrections.probes.ts`'s own `SCREEN_ID_PROBE`) a `FieldProbe` has no
 * direct channel for — `read` only ever receives `(observations, record)`.
 * `observations.match?.screen.id` is the same value `context.screenId`
 * always carries in production, so reading it there is not a guess.
 */
import type { DungeonRecord } from '../../../data';
import { known, unread } from '../../compare/probe-helpers';
import type { FieldProbe, Probe } from '../../compare/probe.types';
import type { ScreenObservations } from '../../detection-types';

/** The record's own list, plus the current screen if it is missing — a
 *  UNION, never a subset, so an existing member is never dropped here. */
const unionRoomScreenIds = (current: DungeonRecord['roomScreenIds'], screenId: string): DungeonRecord['roomScreenIds'] =>
  (current.includes(screenId as DungeonRecord['roomScreenIds'][number]) ? current : [...current, screenId as DungeonRecord['roomScreenIds'][number]]);

const readRoomScreenIds = (observations: ScreenObservations, record: DungeonRecord): Probe<unknown> => {
  const screenId = observations.match?.screen.id;
  // No resolved screen this pass — nothing provable to append.
  if (!screenId) return unread();
  return known(unionRoomScreenIds(record.roomScreenIds, screenId));
};

const ROOM_SCREENS_PROBE: FieldProbe<'dungeon'> = {
  path: 'roomScreenIds',
  label: 'Room screens',
  source: 'native:room-identity',
  confidence: 'certain',
  read: readRoomScreenIds,
};

export { ROOM_SCREENS_PROBE };
