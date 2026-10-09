/* @layer shared-game @kind logic */
import type { ItemGameId, ItemRecord } from '../../types';
import { itemIndexMaps } from './item-index-maps';

const itemByGameId = (match: Partial<ItemGameId>): ItemRecord | undefined =>
  match.receiveItemId !== undefined ? itemIndexMaps.byReceiveId.get(match.receiveItemId) : undefined;

export { itemByGameId };
