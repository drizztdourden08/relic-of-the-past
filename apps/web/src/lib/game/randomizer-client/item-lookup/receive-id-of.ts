/* @layer bridge-wasm @kind logic */
import { asNativeReceiveId, getItem } from '@shared/game/data';
import type { ItemRecord } from '@shared/game/data';

const receiveIdOf = (record: ItemRecord | undefined): number | undefined => {
  if (!record) return undefined;
  if (record.gameId?.receiveItemId !== undefined) return asNativeReceiveId(record.gameId.receiveItemId);
  if (record.aliasOf !== undefined) return asNativeReceiveId(getItem(record.aliasOf).gameId?.receiveItemId);
  return undefined;
};

export { receiveIdOf };
