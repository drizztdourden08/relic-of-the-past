/* @layer shared-game @kind data */
/**
 * A chest the loaded room draws that no `CheckRecord.gameId` covers.
 *
 * The room's chest table is enumerable and needs nothing to have happened —
 * no chest has to be opened for it to report one — so an absence in the
 * dataset is proven, not inferred: `certain`, the same standing the
 * stair/exit/door tables have. `randomizerName` has no native answer, so
 * this proposes an unmistakable placeholder rather than a guessed real name
 * (the same call `item-grants` makes for an uncatalogued item). The chest's
 * static contents byte, though, lives in the same raw id space as
 * `ItemGameId.receiveItemId`, so `vanillaItemIds` resolves to a real item
 * when the catalogue has it and stays empty rather than invented when it
 * does not.
 *
 * `removable: false`: a room's chest table never proves an EXISTING check
 * record wrong to exist (a check carries requirements/presence data the raw
 * chest byte cannot adjudicate), only that a new one is missing. The
 * big-chest-vs-small distinction is deliberately left unimplemented here, as
 * it was in the detector this replaces — no native read distinguishes them
 * yet, so guessing is refused rather than finished.
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
  // No chest table, no resolved room, or no screen to attach a proposal to —
  // stay silent rather than invent a placement for an orphaned chest.
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
    // Proven by the object the room draws — a chest object is what this is.
    kind: 'chest',
    screenId,
    ...(dungeon ? { dungeonId: dungeon.id } : {}),
    // No native answer: an obvious placeholder a reviewer must replace.
    randomizerName: `Unnamed chest ${hex(item.roomId)}#${item.chest.chestIndex}`,
    // The contents byte is a raw receive id: a real item when the catalogue
    // covers it, empty rather than invented when it does not.
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
