/* @layer shared-game @kind logic */
import { asNativeReceiveId } from '@shared/game/data/native-receive-id';
import { HOLDABLE_CATEGORIES } from './holdable-items.constants';
import type { ItemRecord } from '@shared/game/data/types';

const isHoldableRecord = (record: ItemRecord): boolean =>
  HOLDABLE_CATEGORIES.has(record.category)
  && record.dungeonId === undefined
  && asNativeReceiveId(record.gameId?.receiveItemId) !== undefined;

export { isHoldableRecord };
