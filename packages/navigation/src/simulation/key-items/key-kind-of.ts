/* @layer shared-game @kind logic */
import type { ItemId } from '@rotp/game-data';
import { getItemByGameId } from '@rotp/game-data';
import type { KeyKind } from './key-items.type';
import { BIG_KEY_RECEIVE_ID, SMALL_KEY_RECEIVE_ID } from './key-items.constants';

const keyItemId = (receiveItemId: number): ItemId | undefined =>
  getItemByGameId({ receiveItemId })?.id;

const keyKindOf = (itemId: ItemId): KeyKind | null => {
  if (itemId === keyItemId(SMALL_KEY_RECEIVE_ID)) return 'small';
  if (itemId === keyItemId(BIG_KEY_RECEIVE_ID)) return 'big';
  return null;
};

export { keyKindOf };
