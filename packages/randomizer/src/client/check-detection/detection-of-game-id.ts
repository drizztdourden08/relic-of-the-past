/* @layer bridge-wasm @kind logic */
import type { CheckGameId } from '@rotp/game-data';
import { CHEST_MASK_BASE } from './check-detection.constants';
import type { CheckDetection } from './check-detection.type';

const mapDetectionOf = (gameId: CheckGameId): CheckDetection | null => {
  const { roomId, chestIndex, mask, owScreen } = gameId;
  if (roomId !== undefined && chestIndex !== undefined) {
    return { mode: 'room-mask', roomId, mask: CHEST_MASK_BASE << chestIndex };
  }
  if (roomId !== undefined && mask !== undefined) {
    return { mode: 'room-mask', roomId, mask };
  }
  if (owScreen !== undefined && mask !== undefined) {
    return { mode: 'ow-mask', owScreen, mask };
  }
  return null;
};

const progressDetectionOf = (gameId: CheckGameId): CheckDetection | null => {
  const { mask, bufferIndex, compare, value, roomFlag } = gameId;
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

const detectionOfGameId = (gameId: CheckGameId): CheckDetection | null =>
  mapDetectionOf(gameId) ?? progressDetectionOf(gameId);

export { detectionOfGameId };
