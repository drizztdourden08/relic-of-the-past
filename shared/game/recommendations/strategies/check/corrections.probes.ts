/* @layer shared-game @kind logic */
import { getScreen } from '../../../data';
import type { ScreenId } from '../../../data';
import { known } from '../../compare/probe-reading';
import type { FieldProbe } from '../../compare/probe.type';
import type { ScreenObservations } from '../../detection-types';
import { ROOM_CHESTS_SOURCE } from './check.constants';
import { chestFor } from './chest-for';
import { roomIdOf } from './room-id-of';

const roomOfScreen = (screenId: ScreenId | undefined): number | null => {
  if (!screenId) return null;
  return getScreen(screenId).gameId.roomIndex ?? null;
};

const currentScreenId = (observations: ScreenObservations): ScreenId | null => observations.match?.screen.id ?? null;

const kindProbe: FieldProbe<'check'> = {
  path: 'kind',
  label: 'Kind',
  source: ROOM_CHESTS_SOURCE,
  confidence: 'certain',
  applies: (observations, record) => chestFor(observations, record) != null,
  read: () => known('chest'),
};

const screenIdProbe: FieldProbe<'check'> = {
  path: 'screenId',
  label: 'Screen',
  source: ROOM_CHESTS_SOURCE,
  confidence: 'certain',
  applies: (observations, record) => {
    if (chestFor(observations, record) == null || !currentScreenId(observations)) return false;
    const recordedRoom = roomOfScreen(record.screenId);
    return recordedRoom !== null && recordedRoom !== roomIdOf(observations);
  },
  read: observations => known(currentScreenId(observations)),
};

const checkCorrectionProbes: readonly FieldProbe<'check'>[] = [kindProbe, screenIdProbe];

export { checkCorrectionProbes };
