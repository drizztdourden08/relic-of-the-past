/* @layer bridge-wasm @kind logic */
import type { CheckGameId } from '@rotp/game-data';
import { CHEST_OPEN_MASKS } from './check-facts.constants';

const isRoomFactMet = (gameId: CheckGameId, readRoomWord: (roomId: number) => number): boolean => {
  const { roomId, chestIndex, mask, roomFlag } = gameId;
  if (roomFlag !== undefined) return (readRoomWord(roomFlag.roomId) & (CHEST_OPEN_MASKS[roomFlag.chestIndex] ?? 0)) !== 0;
  if (roomId === undefined) return false;
  if (chestIndex !== undefined) return (readRoomWord(roomId) & (CHEST_OPEN_MASKS[chestIndex] ?? 0)) !== 0;
  if (mask !== undefined) return (readRoomWord(roomId) & mask) !== 0;
  return false;
};

export { isRoomFactMet };
