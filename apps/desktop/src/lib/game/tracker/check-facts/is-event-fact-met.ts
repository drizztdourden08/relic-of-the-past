/* @layer bridge-wasm @kind logic */
import type { CheckGameId } from '@rotp/game-data';

const isEventFactMet = (gameId: CheckGameId, readEventByte: (byteIndex: number) => number): boolean => {
  const { eventBit } = gameId;
  if (eventBit === undefined) return false;
  return ((readEventByte(eventBit >> 3) >> (eventBit & 7)) & 1) === 1;
};

export { isEventFactMet };
