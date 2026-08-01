/* @layer shared-game @kind logic */
/**
 * Which received item is a dungeon key, by id.
 *
 * Identity is the native receive index the game actually delivers — 0x24 for a
 * small key, 0x32 for the big one — resolved to a record through the facade, the
 * same two constants the discovery step already uses for a guard's drop. It used
 * to be `itemName.startsWith('Small Key')`, which is both a name test and the
 * wrong shape: the dataset ALSO holds 26 per-dungeon key records (native
 * 0x92–0xad), every one of which carries no `dungeonId`, so a name prefix
 * matched them and then had to parse the dungeon back out of the parenthetical.
 *
 * Those catalog records are deliberately not a second path here. The vanilla core
 * this engine drives never delivers them, and if one ever arrived it could not be
 * attributed from the record anyway — which is exactly why attribution comes from
 * the matched check's `dungeonId` instead of from the item.
 */
import type { ItemId } from '../data';
import { getItemByGameId } from '../data';

/** Native receive indices for the generic key grants (`Link_ReceiveItem`). */
const SMALL_KEY_RECEIVE_ID = 0x24;
const BIG_KEY_RECEIVE_ID = 0x32;

type KeyKind = 'small' | 'big';

/**
 * Resolved lazily rather than at module load: a published dataset bundle can
 * replace the records after import, and a snapshot taken at import time would pin
 * the pre-bundle ids (same reason the tracker's slot map resolves per poll).
 */
const keyItemId = (receiveItemId: number): ItemId | undefined =>
  getItemByGameId({ receiveItemId })?.id;

/** Which kind of dungeon key this item is, or null when it is not one. */
const keyKindOf = (itemId: ItemId): KeyKind | null => {
  if (itemId === keyItemId(SMALL_KEY_RECEIVE_ID)) return 'small';
  if (itemId === keyItemId(BIG_KEY_RECEIVE_ID)) return 'big';
  return null;
};

export { keyKindOf, SMALL_KEY_RECEIVE_ID, BIG_KEY_RECEIVE_ID };
export type { KeyKind };
