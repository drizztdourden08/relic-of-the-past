/* @layer shared-game @kind logic */
import { asNativeReceiveId } from '@rotp/game-data';
import { HOLDABLE_CATEGORIES } from './holdable-items.constants';
import type { ItemRecord } from '@rotp/game-data';

const isHoldableRecord = (record: ItemRecord): boolean =>
  HOLDABLE_CATEGORIES.has(record.category)
  && record.dungeonId === undefined
  && asNativeReceiveId(record.gameId?.receiveItemId) !== undefined;

export { isHoldableRecord };
