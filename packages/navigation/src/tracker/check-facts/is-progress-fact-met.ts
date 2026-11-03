/* @layer bridge-wasm @kind logic */
import { thresholdMet } from '@rotp/randomizer';
import type { CheckGameId } from '@rotp/game-data';

const isProgressFactMet = (gameId: CheckGameId, readProgByte: (bufferIndex: number) => number): boolean => {
  const { bufferIndex, mask, compare, value } = gameId;
  if (bufferIndex === undefined) return false;
  if (mask !== undefined) return (readProgByte(bufferIndex) & mask) !== 0;
  if (compare !== undefined) return thresholdMet(readProgByte(bufferIndex), compare, value);
  return false;
};

export { isProgressFactMet };
