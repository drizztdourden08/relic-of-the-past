/* @layer shared-game @kind logic */
import { find, getDungeonByGameId, getItemByGameId } from '../../../data';
import type { CheckRecord, ScreenId } from '../../../data';
import { unread } from '../../compare/probe-reading';
import type { Probe, SetProbe } from '../../compare/probe.type';
import type { ScreenObservations } from '../../detection-types';
import { hexLabel } from '../hex-label';
import { ROOM_CHESTS_SOURCE } from './check.constants';
import type { RoomChest } from './room-chest.type';
import { roomIdOf } from './room-id-of';

const readLive = (observations: ScreenObservations, screenId: ScreenId | null): Probe<readonly RoomChest[]> => {
  const { chests } = observations;
  const roomId = roomIdOf(observations);
  if (!chests || roomId == null || !screenId) return unread();
  return { known: true, value: chests.map(chest => ({ roomId, chest })) };
};

const readDataset = (observations: ScreenObservations): readonly CheckRecord[] => {
  const roomId = roomIdOf(observations);
  if (roomId == null) return [];
  return find('check', check => check.gameId.roomId === roomId && check.gameId.chestIndex != null);
};

const liveKey = (item: RoomChest): string => `${item.roomId}:${item.chest.chestIndex}`;

const datasetKey = (record: CheckRecord): string => `${record.gameId.roomId}:${record.gameId.chestIndex}`;

const toProposed = (item: RoomChest, observations: ScreenObservations, screenId: ScreenId | null): Omit<CheckRecord, 'id'> | null => {
  if (!screenId) return null;
  const palaceIndex = observations.liveGameId?.palaceIndex;
  const dungeon = palaceIndex == null ? undefined : getDungeonByGameId({ palaceIndex });
  const content = getItemByGameId({ receiveItemId: item.chest.itemId });
  return {
    gameId: { roomId: item.roomId, chestIndex: item.chest.chestIndex },
    kind: 'chest',
    screenId,
    ...(dungeon ? { dungeonId: dungeon.id } : {}),
    name: `Unnamed chest ${hexLabel(item.roomId)}#${item.chest.chestIndex}`,
    vanillaItemIds: content ? [content.id] : [],
  };
};

const chestPresenceProbe: SetProbe<'check', RoomChest> = {
  id: 'check-chest-presence',
  noun: 'chest',
  readLive,
  readDataset,
  liveKey,
  datasetKey,
  toProposed,
  removable: false,
  source: ROOM_CHESTS_SOURCE,
  confidence: 'certain',
};

export { chestPresenceProbe };
