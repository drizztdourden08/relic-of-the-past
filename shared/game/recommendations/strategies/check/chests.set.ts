/* @layer shared-game @kind data */
/**
 * A chest the loaded room draws that no `CheckRecord.gameId` covers.
 *
 * The room's chest table is enumerable (no chest has to be opened for it to
 * report one), so an absence in the dataset is proven: `certain`.
 * `randomizerName` has no native answer, so this proposes an unmistakable
 * placeholder, not a guessed name. The contents byte is in the same raw id
 * space as `ItemGameId.receiveItemId`, so `vanillaItemIds` resolves to a real
 * item when the catalogue has it and stays empty when it does not.
 *
 * `removable: false`: the chest table never proves an EXISTING check record
 * wrong to exist, only that a new one is missing. Big vs small chest is left
 * unimplemented: no native read distinguishes them yet, so guessing is refused.
 */
import { find, getDungeonByGameId, getItemByGameId } from '../../../data';
import type { CheckRecord, ScreenId } from '../../../data';
import { unread } from '../../compare/probe-helpers';
import type { Probe, SetProbe } from '../../compare/probe.types';
import type { ChestObservation, ScreenObservations } from '../../detection-types';
import { roomIdOf } from './chest-lookup';

const SOURCE = 'native:room-chests';

const hex = (n: number): string => `0x${n.toString(16).toUpperCase()}`;

interface RoomChest { roomId: number; chest: ChestObservation }

const readLive = (observations: ScreenObservations, screenId: ScreenId | null): Probe<readonly RoomChest[]> => {
  const { chests } = observations;
  const roomId = roomIdOf(observations);
  // With no chest table, no resolved room, or no screen to attach a proposal to,
  // stay silent instead of inventing a placement for an orphaned chest.
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
    // Proven by the object the room draws.
    kind: 'chest',
    screenId,
    ...(dungeon ? { dungeonId: dungeon.id } : {}),
    // No native answer: an obvious placeholder a reviewer must replace.
    randomizerName: `Unnamed chest ${hex(item.roomId)}#${item.chest.chestIndex}`,
    // The contents byte is a raw receive id: a real item when the catalogue
    // covers it, empty when it does not.
    vanillaItemIds: content ? [content.id] : [],
  };
};

const CHEST_PRESENCE_PROBE: SetProbe<'check', RoomChest> = {
  id: 'check-chest-presence',
  noun: 'chest',
  readLive,
  readDataset,
  liveKey,
  datasetKey,
  toProposed,
  removable: false,
  source: SOURCE,
  confidence: 'certain',
};

export { CHEST_PRESENCE_PROBE, SOURCE };
