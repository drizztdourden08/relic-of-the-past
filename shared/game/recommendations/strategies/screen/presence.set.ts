/* @layer shared-game @kind logic */
import { PALACE_NONE } from '@rotp/game-data';
import { gameIdLabel } from '@rotp/game-data';
import type { GameScreenId } from '@rotp/game-data';
import type { ScreenGameId, ScreenRecord } from '@rotp/game-data';
import { unread } from '../../compare/probe-reading';
import type { Probe, SetProbe } from '../../compare/probe.type';
import type { ScreenObservations } from '../../detection-types';
import type { CurrentScreenIdentity } from './presence.set.type';
import { buildScreenDraftRecord } from './screen-draft';

const keyOfGameScreenId = (gameId: GameScreenId): string =>
  (gameId.kind === 'overworld' ? `overworld:${gameId.screen}` : `room:${gameId.room}:${gameId.palace ?? '-'}`);

const currentGameScreenId = (observations: ScreenObservations): GameScreenId | null => {
  const { liveGameId, isIndoors } = observations;
  if (!liveGameId) return null;
  if (!isIndoors) {
    return liveGameId.overworldIndex == null ? null : { kind: 'overworld', screen: liveGameId.overworldIndex };
  }
  return liveGameId.roomIndex == null ? null : { kind: 'room', room: liveGameId.roomIndex, palace: liveGameId.palaceIndex };
};

const readLive = (observations: ScreenObservations): Probe<readonly CurrentScreenIdentity[]> => {
  const gameId = currentGameScreenId(observations);
  if (!gameId) return unread();
  return { known: true, value: [{ gameId, matchedScreenId: observations.match?.screen.id ?? null }] };
};

const readDataset = (observations: ScreenObservations): readonly ScreenRecord[] =>
  (observations.match ? [observations.match.screen] : []);

const liveKey = (item: CurrentScreenIdentity): string => item.matchedScreenId ?? keyOfGameScreenId(item.gameId);

const datasetKey = (record: ScreenRecord): string => record.id;

const toProposed = (item: CurrentScreenIdentity, observations: ScreenObservations): Omit<ScreenRecord, 'id'> | null => {
  const { liveGameId, isIndoors, isDarkWorld } = observations;
  if (!liveGameId) return null;

  const palaceIndex = liveGameId.palaceIndex === PALACE_NONE ? undefined : liveGameId.palaceIndex;
  const gameId: ScreenGameId = isIndoors
    ? { roomIndex: liveGameId.roomIndex, palaceIndex }
    : { overworldIndex: liveGameId.overworldIndex };

  return buildScreenDraftRecord(
    gameId,
    isIndoors ? 'interior' : 'overworld',
    isDarkWorld ? 'dark' : 'light',
    gameIdLabel(item.gameId),
  );
};

const screenPresenceProbe: SetProbe<'screen', CurrentScreenIdentity> = {
  id: 'screen-presence',
  noun: 'screen',
  readLive,
  readDataset,
  liveKey,
  datasetKey,
  toProposed,
  removable: false,
  source: 'native:room-identity',
  confidence: 'likely',
};

export { screenPresenceProbe };
export type { CurrentScreenIdentity } from './presence.set.type';
