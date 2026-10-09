/* @layer shared-game @kind logic */
import type { ItemRecord } from '../../types';

const itemIndexMaps = {
  byReceiveId: new Map<number, ItemRecord>(),
};

export { itemIndexMaps };
