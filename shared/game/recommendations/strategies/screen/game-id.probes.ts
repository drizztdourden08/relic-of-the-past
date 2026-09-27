/* @layer shared-game @kind data */
/**
 * Field probes over `ScreenGameId`, which holds the four native identifiers a screen
 * record claims. Every value is read off a table fully enumerable for the
 * loaded room, so a disagreement is proven: every probe is `certain`, and they
 * compare unconditionally (a wrong value is reported, not only a missing one).
 *
 * `roomIndex`, `overworldIndex` and `entranceId` only describe the room the
 * game is CURRENTLY in, so each requires `record` to BE the resolved screen:
 * `screen.strategy.ts`'s `subjects` can widen past the current screen for the
 * palace-mismatch case, and comparing against an unrelated subject would
 * manufacture a mismatch. `palaceIndex` is the exception: see its comment.
 */
import type { ScreenRecord } from '../../../data/types';
import { PALACE_NONE } from '../../../logic/queries/dungeon-values';
import { hex2, hex4, known, unread } from '../../compare/probe-helpers';
import type { FieldProbe, Probe } from '../../compare/probe.types';
import type { ScreenObservations } from '../../detection-types';
import { resolvedPalaceMismatches } from './palace-mismatches';

/** True when `record` is the screen the game is currently resolved to. */
const isCurrentScreen = (observations: ScreenObservations, record: ScreenRecord): boolean =>
  observations.match?.screen.id === record.id;

/**
 * RAM $010E names the entrance this room was entered through only when it was
 * entered DIRECTLY; walking in from another indoor room leaves it stale.
 * `entranceRooms[whichEntrance] === roomIndex` is the only way to tell.
 */
const enteredDirectly = (observations: ScreenObservations): boolean => {
  const { entranceRooms, liveGameId } = observations;
  if (!entranceRooms || liveGameId?.entranceId == null || liveGameId.roomIndex == null) return false;
  return entranceRooms[liveGameId.entranceId] === liveGameId.roomIndex;
};

/**
 * `PALACE_NONE` is what the register holds for a cave, for a house, and for a
 * palace room the game has not put in palace context. The three are
 * indistinguishable in it, so it says nothing about the record's own palace
 * membership and reads as unread, not as a value to compare.
 */
const palaceReading = (value: number | undefined): Probe<number | undefined> =>
  (value === PALACE_NONE ? unread() : known(value));

const ROOM_INDEX_PROBE: FieldProbe<'screen'> = {
  path: 'gameId.roomIndex',
  label: 'Room',
  format: hex4,
  source: 'native:room-identity',
  confidence: 'certain',
  applies: (observations, record) => observations.isIndoors && isCurrentScreen(observations, record),
  read: observations => known(observations.liveGameId?.roomIndex),
};

/** Indoors this RAM slot is leftover from the last outdoor screen (never
 *  refreshed on an indoor transition), so comparing it there would manufacture a mismatch. */
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
 * The one field that reaches beyond the current screen: `screen.strategy.ts`
 * folds every screen the palace-scan fallback rescued this session into
 * `subjects`. So `applies` is `() => true` and `read` branches: the current
 * screen reads the live RAM value (indoors only), any other subject looks
 * itself up in the recorded mismatch list, and anything else is `unread()`.
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
      return observations.isIndoors ? palaceReading(observations.liveGameId?.palaceIndex) : unread();
    }
    const mismatch = resolvedPalaceMismatches(observations).find(m => m.screenId === record.id);
    return mismatch ? palaceReading(mismatch.actual) : unread();
  },
};

/**
 * RAM $010E holds 0 out of boot and is not rewritten by loading a save state,
 * so a live 0 cannot be told apart from the player having walked through
 * entrance 0x00. It is not evidence, and reads as unread, not as a value to
 * compare.
 */
const ENTRANCE_ID_PROBE: FieldProbe<'screen'> = {
  path: 'gameId.entranceId',
  label: 'Entrance',
  format: hex2,
  source: 'native:ram-010E',
  confidence: 'certain',
  applies: (observations, record) => (
    observations.isIndoors && isCurrentScreen(observations, record) && enteredDirectly(observations)
  ),
  read: (observations) => {
    const entranceId = observations.liveGameId?.entranceId;
    return entranceId ? known(entranceId) : unread();
  },
};

const GAME_ID_PROBES: readonly FieldProbe<'screen'>[] = [
  ROOM_INDEX_PROBE, OVERWORLD_INDEX_PROBE, PALACE_INDEX_PROBE, ENTRANCE_ID_PROBE,
];

export { GAME_ID_PROBES, isCurrentScreen };
