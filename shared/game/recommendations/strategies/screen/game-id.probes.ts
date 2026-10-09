/* @layer shared-game @kind logic */
import { PALACE_NONE } from '../../../logic/queries/dungeon-values';
import { known, unread } from '../../compare/probe-reading';
import type { FieldProbe, Probe } from '../../compare/probe.type';
import { hex2, hex4 } from '../../compare/value-format';
import type { ScreenObservations } from '../../detection-types';
import { isCurrentScreen } from './is-current-screen';
import { resolvedPalaceMismatches } from './palace-mismatches';

const enteredDirectly = (observations: ScreenObservations): boolean => {
  const { entranceRooms, liveGameId } = observations;
  if (!entranceRooms || liveGameId?.entranceId == null || liveGameId.roomIndex == null) return false;
  return entranceRooms[liveGameId.entranceId] === liveGameId.roomIndex;
};

const palaceReading = (value: number | undefined): Probe<number | undefined> =>
  (value === PALACE_NONE ? unread() : known(value));

const roomIndexProbe: FieldProbe<'screen'> = {
  path: 'gameId.roomIndex',
  label: 'Room',
  format: hex4,
  source: 'native:room-identity',
  confidence: 'certain',
  applies: (observations, record) => observations.isIndoors && isCurrentScreen(observations, record),
  read: observations => known(observations.liveGameId?.roomIndex),
};

const overworldIndexProbe: FieldProbe<'screen'> = {
  path: 'gameId.overworldIndex',
  label: 'OW screen',
  format: hex2,
  source: 'native:room-identity',
  confidence: 'certain',
  applies: (observations, record) => !observations.isIndoors && isCurrentScreen(observations, record),
  read: observations => known(observations.liveGameId?.overworldIndex),
};

const palaceIndexProbe: FieldProbe<'screen'> = {
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

const entranceIdProbe: FieldProbe<'screen'> = {
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

const gameIdProbes: readonly FieldProbe<'screen'>[] = [
  roomIndexProbe, overworldIndexProbe, palaceIndexProbe, entranceIdProbe,
];

export { gameIdProbes };
