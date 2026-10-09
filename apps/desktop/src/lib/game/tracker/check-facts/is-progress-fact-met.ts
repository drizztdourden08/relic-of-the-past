/* @layer bridge-wasm @kind logic */
import type { CheckGameId } from '@rotp/game-data';

const thresholdMet = (val: number, compare: 'gte' | 'eq' | 'any-of', value: number | number[] | undefined): boolean => {
  if (compare === 'gte') return val >= (value as number);
  if (compare === 'eq') return val === (value as number);
  if (compare === 'any-of') return (value as number[]).includes(val);
  return false;
};

const isProgressFactMet = (gameId: CheckGameId, readProgByte: (bufferIndex: number) => number): boolean => {
  const { bufferIndex, mask, compare, value } = gameId;
  if (bufferIndex === undefined) return false;
  if (mask !== undefined) return (readProgByte(bufferIndex) & mask) !== 0;
  if (compare !== undefined) return thresholdMet(readProgByte(bufferIndex), compare, value);
  return false;
};

export { isProgressFactMet };
