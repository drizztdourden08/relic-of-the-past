/* @layer shared-game @kind data */
/**
 * Two field-level corrections the room's own chest table proves about an
 * ALREADY-CATALOGUED check: it is not recorded as a chest though a chest
 * object draws it, or its `screenId` names a screen belonging to a different
 * room entirely. Both read off the same enumerable chest table as
 * `chests.set.ts`'s create probe, so both are `certain`.
 *
 * `SCREEN_ID_PROBE`'s live value is the CURRENT screen's id, which a
 * `FieldProbe` has no direct channel for (`read` only ever receives
 * `(observations, record)`, as `probe.types.ts` says). `observations.match?
 * .screen.id` is the same value `context.screenId` always carries in
 * production (`use-screen-observations.ts` sets `screenId = match?.screen.id
 * ?? null`), so reading it off `match` here is not a guess, just the one
 * channel a field probe actually has for "the screen we are standing on".
 *
 * Chest CONTENTS are deliberately left alone by both probes: the check
 * collection's `vanillaItemIds` is edited per dungeon-specific reward in ways
 * the raw chest byte cannot adjudicate. That is `item-grants`' business, not
 * this one's. The screen comparison also goes through the RECORDED screen's
 * own `roomIndex` instead of comparing screen ids directly: one room can
 * legitimately carry several screen records (a progress variant of the same
 * interior), so a check attached to a variant this pass did not resolve is
 * correct, not wrong. Only a recorded screen belonging to ANOTHER room
 * entirely is a real mismatch.
 */
import { getScreen } from '../../../data';
import type { CheckRecord, ScreenId } from '../../../data';
import { known } from '../../compare/probe-helpers';
import type { FieldProbe } from '../../compare/probe.types';
import type { ScreenObservations } from '../../detection-types';
import { chestFor, roomIdOf } from './chest-lookup';
import { SOURCE } from './chests.set';

/** The room the record's own `screenId` names, or null when nothing provable is on it. */
const roomOfScreen = (screenId: ScreenId | undefined): number | null => {
  if (!screenId) return null;
  return getScreen(screenId).gameId.roomIndex ?? null;
};

const currentScreenId = (observations: ScreenObservations): ScreenId | null => observations.match?.screen.id ?? null;

const KIND_PROBE: FieldProbe<'check'> = {
  path: 'kind',
  label: 'Kind',
  source: SOURCE,
  confidence: 'certain',
  applies: (observations, record) => chestFor(observations, record) != null,
  read: () => known('chest'),
};

const SCREEN_ID_PROBE: FieldProbe<'check'> = {
  path: 'screenId',
  label: 'Screen',
  source: SOURCE,
  confidence: 'certain',
  applies: (observations, record) => {
    if (chestFor(observations, record) == null || !currentScreenId(observations)) return false;
    const recordedRoom = roomOfScreen(record.screenId);
    return recordedRoom !== null && recordedRoom !== roomIdOf(observations);
  },
  read: observations => known(currentScreenId(observations)),
};

const CHECK_CORRECTION_PROBES: readonly FieldProbe<'check'>[] = [KIND_PROBE, SCREEN_ID_PROBE];

export { CHECK_CORRECTION_PROBES };
