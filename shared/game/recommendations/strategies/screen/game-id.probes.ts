/* @layer shared-game @kind data */
/**
 * Field probes over `ScreenGameId` — the four native identifiers a screen
 * record claims. Every value here is read off a table that is fully
 * enumerable for the loaded room (the room header, the overworld screen
 * index, `cur_palace_index_x2`, RAM $010E), so a disagreement is proven, not
 * inferred: every probe below is `confidence: 'certain'`. This is what closes
 * the bug the old `screen-identity.ts` detector had — it only ever proposed a
 * fix when a field was MISSING, so a wrong value was silently never reported.
 * These compare unconditionally.
 *
 * Three of the four (`roomIndex`, `overworldIndex`, `entranceId`) only ever
 * describe the room the game is CURRENTLY standing in, so each requires
 * `record` to BE the currently resolved screen before comparing at all — that
 * gate matters because `screen.strategy.ts`'s `subjects` can widen past the
 * current screen for the palace-mismatch case below, and comparing one of
 * these three against some other, unrelated subject would manufacture a
 * mismatch out of nothing (e.g. reading the CURRENT room index as if it
 * described a screen visited earlier this session). `palaceIndex` is the one
 * exception: see its own comment.
 */
import type { ScreenRecord } from '../../../data/types';
import { hex2, hex4, known, unread } from '../../compare/probe-helpers';
import type { FieldProbe } from '../../compare/probe.types';
import type { ScreenObservations } from '../../detection-types';
import { resolvedPalaceMismatches } from './palace-mismatches';

/** True when `record` is the screen the game is currently resolved to. */
const isCurrentScreen = (observations: ScreenObservations, record: ScreenRecord): boolean =>
  observations.match?.screen.id === record.id;

/**
 * RAM $010E holds the room this screen was actually entered through, but only
 * when it was entered DIRECTLY — walking in from another indoor room leaves
 * it stale (still naming the entrance that led to the FIRST room of the
 * chain). `entranceRooms[whichEntrance] === roomIndex` is the only way to
 * tell the two cases apart.
 */
const enteredDirectly = (observations: ScreenObservations): boolean => {
  const { entranceRooms, liveGameId } = observations;
  if (!entranceRooms || liveGameId?.entranceId == null || liveGameId.roomIndex == null) return false;
  return entranceRooms[liveGameId.entranceId] === liveGameId.roomIndex;
};

const ROOM_INDEX_PROBE: FieldProbe<'screen'> = {
  path: 'gameId.roomIndex',
  label: 'Room',
  format: hex4,
  source: 'native:room-identity',
  confidence: 'certain',
  applies: (observations, record) => observations.isIndoors && isCurrentScreen(observations, record),
  read: observations => known(observations.liveGameId?.roomIndex),
};

/**
 * Indoors, this RAM slot is leftover from the last outdoor screen — it is
 * never refreshed on an indoor transition, so comparing it indoors would
 * manufacture a mismatch against a value the game never meant to describe
 * this room with.
 */
const OVERWORLD_INDEX_PROBE: FieldProbe<'screen'> = {
  path: 'gameId.overworldIndex',
  label: 'OW screen',
  format: hex2,
  source: 'native:room-identity',
  confidence: 'certain',
  applies: (observations, record) => !observations.isIndoors && isCurrentScreen(observations, record),
  read: observations => known(observations.liveGameId?.overworldIndex),
};

/**
 * The one field that must reach beyond the current screen: `screen.strategy.ts`
 * folds every screen the palace-scan fallback has rescued this session into
 * `subjects`, not only the one loaded right now. So `applies` stays `() =>
 * true` and `read` branches instead: the current screen reads the live RAM
 * value directly (only meaningful indoors — outdoors it is unread()), any
 * other subject looks itself up in the recorded mismatch list, and a subject
 * that is neither reads `unread()` — exactly the "if neither applies" case.
 */
const PALACE_INDEX_PROBE: FieldProbe<'screen'> = {
  path: 'gameId.palaceIndex',
  label: 'Palace',
  format: hex2,
  source: 'native:room-identity',
  confidence: 'certain',
  applies: () => true,
  read: (observations, record) => {
    if (isCurrentScreen(observations, record)) {
      return observations.isIndoors ? known(observations.liveGameId?.palaceIndex) : unread();
    }
    const mismatch = resolvedPalaceMismatches(observations).find(m => m.screenId === record.id);
    return mismatch ? known(mismatch.actual) : unread();
  },
};

const ENTRANCE_ID_PROBE: FieldProbe<'screen'> = {
  path: 'gameId.entranceId',
  label: 'Entrance',
  format: hex2,
  source: 'native:ram-010E',
  confidence: 'certain',
  applies: (observations, record) => (
    observations.isIndoors && isCurrentScreen(observations, record) && enteredDirectly(observations)
  ),
  read: observations => known(observations.liveGameId?.entranceId),
};

const GAME_ID_PROBES: readonly FieldProbe<'screen'>[] = [
  ROOM_INDEX_PROBE, OVERWORLD_INDEX_PROBE, PALACE_INDEX_PROBE, ENTRANCE_ID_PROBE,
];

export { GAME_ID_PROBES, isCurrentScreen };
