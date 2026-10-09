/* @layer bridge-wasm @kind logic */
import type { CheckGameId } from '@rotp/game-data';
import { CHEST_MASK_BASE } from './check-detection.constants';
import type { CheckDetection } from './check-detection.type';

const detectionOfGameId = (gameId: CheckGameId): CheckDetection | null => {
  const { roomId, chestIndex, mask, owScreen, bufferIndex, compare, value, roomFlag } = gameId;
  if (roomId !== undefined && chestIndex !== undefined) {
    return { mode: 'room-mask', roomId, mask: CHEST_MASK_BASE << chestIndex };
  }
  if (roomId !== undefined && mask !== undefined) {
    return { mode: 'room-mask', roomId, mask };
  }
  if (owScreen !== undefined && mask !== undefined) {
    return { mode: 'ow-mask', owScreen, mask };
  }
  if (bufferIndex !== undefined && mask !== undefined) {
    return { mode: 'progress', bufferIndex, mask };
  }
  if (bufferIndex !== undefined && compare !== undefined) {
    return { mode: 'progress', bufferIndex, compare, value };
  }
  if (roomFlag !== undefined) {
    return { mode: 'room-mask', roomId: roomFlag.roomId, mask: CHEST_MASK_BASE << roomFlag.chestIndex };
  }
  return null;
};

export { detectionOfGameId };
