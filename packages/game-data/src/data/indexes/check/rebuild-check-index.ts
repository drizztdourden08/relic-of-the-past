/* @layer shared-game @kind logic */
import type { CheckRecord } from '../../types';
import { checkIndexMaps } from './check-index-maps';
import { eventKey } from './event-key';

const pushInto = <K>(map: Map<K, CheckRecord[]>, key: K, record: CheckRecord): void => {
  const bucket = map.get(key);
  if (bucket) bucket.push(record); else map.set(key, [record]);
};

const indexByLocation = (check: CheckRecord): void => {
  const { byChest, byRoomMask, byOwScreen } = checkIndexMaps;
  const { roomId, chestIndex, mask, owScreen } = check.gameId;
  if (roomId !== undefined && chestIndex !== undefined) byChest.set(`${roomId}:${chestIndex}`, check);
  if (roomId !== undefined && mask !== undefined && chestIndex === undefined) {
    pushInto(byRoomMask, `${roomId}:${mask}`, check);
  }
  if (owScreen !== undefined && mask !== undefined) pushInto(byOwScreen, `${owScreen}:${mask}`, check);
};

const indexByTrigger = (check: CheckRecord): void => {
  const { byBuffer, bySpriteType, byEventThreshold } = checkIndexMaps;
  const { mask, bufferIndex, compare, value, spriteType } = check.gameId;
  if (bufferIndex !== undefined && mask !== undefined) pushInto(byBuffer, `${bufferIndex}:${mask}`, check);
  if (spriteType !== undefined) pushInto(bySpriteType, spriteType, check);
  if (bufferIndex !== undefined && compare !== undefined) byEventThreshold.set(eventKey(bufferIndex, compare, value), check);
};

const rebuildCheckIndex = (records: readonly CheckRecord[]): void => {
  const { byChest, byBuffer, byRoomMask, byOwScreen, bySpriteType, byEventThreshold } = checkIndexMaps;
  byChest.clear();
  byBuffer.clear();
  byRoomMask.clear();
  byOwScreen.clear();
  bySpriteType.clear();
  byEventThreshold.clear();

  for (const check of records) {
    indexByLocation(check);
    indexByTrigger(check);
  }
};

export { rebuildCheckIndex };
