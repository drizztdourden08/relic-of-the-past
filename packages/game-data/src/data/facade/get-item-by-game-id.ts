/* @layer shared-game @kind logic */
import { itemByGameId } from '../indexes';
import type { ItemGameId, ItemRecord } from '../types';

const getItemByGameId = (match: Partial<ItemGameId>): ItemRecord | undefined => itemByGameId(match);

export { getItemByGameId };
