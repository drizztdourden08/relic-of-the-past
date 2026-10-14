/* @layer shared-game @kind logic */
import { checkIndexMaps } from './check-index-maps';
import type { CheckLookup } from './check-lookups.type';
import { disambiguate } from './disambiguate';
import { eventKey } from './event-key';

const checkLookups: readonly CheckLookup[] = [
  (match) => {
    const { roomId, chestIndex } = match;
    if (roomId === undefined || chestIndex === undefined) return undefined;
    return checkIndexMaps.byChest.get(`${roomId}:${chestIndex}`);
  },
  (match) => {
    const { bufferIndex, mask } = match;
    if (bufferIndex === undefined || mask === undefined) return undefined;
    return disambiguate(checkIndexMaps.byBuffer.get(`${bufferIndex}:${mask}`) ?? [], match);
  },
  (match) => {
    const { bufferIndex, compare, value } = match;
    if (bufferIndex === undefined || compare === undefined) return undefined;
    return checkIndexMaps.byEventThreshold.get(eventKey(bufferIndex, compare, value));
  },
  (match) => {
    const { roomId, mask } = match;
    if (roomId === undefined || mask === undefined) return undefined;
    return disambiguate(checkIndexMaps.byRoomMask.get(`${roomId}:${mask}`) ?? [], match);
  },
  (match) => {
    const { owScreen, mask } = match;
    if (owScreen === undefined || mask === undefined) return undefined;
    return disambiguate(checkIndexMaps.byOwScreen.get(`${owScreen}:${mask}`) ?? [], match);
  },
  (match) => {
    const { spriteType } = match;
    if (spriteType === undefined) return undefined;
    return disambiguate(checkIndexMaps.bySpriteType.get(spriteType) ?? [], match);
  },
];

export { checkLookups };
