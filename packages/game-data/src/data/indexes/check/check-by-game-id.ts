/* @layer shared-game @kind logic */
import type { CheckGameId, CheckRecord } from '../../types';
import { checkIndexMaps } from './check-index-maps';
import { disambiguate } from './disambiguate';
import { eventKey } from './event-key';

const checkByGameId = (match: Partial<CheckGameId>): CheckRecord | undefined => {
  const { byChest, byBuffer, byRoomMask, byOwScreen, bySpriteType, byEventThreshold } = checkIndexMaps;
  if (match.roomId !== undefined && match.chestIndex !== undefined) {
    const hit = byChest.get(`${match.roomId}:${match.chestIndex}`);
    if (hit) return hit;
  }
  if (match.bufferIndex !== undefined && match.mask !== undefined) {
    const hit = disambiguate(byBuffer.get(`${match.bufferIndex}:${match.mask}`) ?? [], match);
    if (hit) return hit;
  }
  if (match.bufferIndex !== undefined && match.compare !== undefined) {
    const hit = byEventThreshold.get(eventKey(match.bufferIndex, match.compare, match.value));
    if (hit) return hit;
  }
  if (match.roomId !== undefined && match.mask !== undefined) {
    const hit = disambiguate(byRoomMask.get(`${match.roomId}:${match.mask}`) ?? [], match);
    if (hit) return hit;
  }
  if (match.owScreen !== undefined && match.mask !== undefined) {
    const hit = disambiguate(byOwScreen.get(`${match.owScreen}:${match.mask}`) ?? [], match);
    if (hit) return hit;
  }
  if (match.spriteType !== undefined) {
    const hit = disambiguate(bySpriteType.get(match.spriteType) ?? [], match);
    if (hit) return hit;
  }
  return undefined;
};

export { checkByGameId };
