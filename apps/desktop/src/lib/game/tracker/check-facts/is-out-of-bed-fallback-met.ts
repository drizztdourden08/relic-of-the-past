/* @layer bridge-wasm @kind logic */
import type { CheckGameId } from '@shared/game/data';
import { BED_STATE_BUFFER_INDEX } from './check-facts.constants';

const isOutOfBedFallbackMet = (gameId: CheckGameId, readProgByte: (bufferIndex: number) => number): boolean =>
  gameId.bufferIndex === BED_STATE_BUFFER_INDEX && readProgByte(0) >= 1;

export { isOutOfBedFallbackMet };
