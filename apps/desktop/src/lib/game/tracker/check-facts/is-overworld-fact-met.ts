/* @layer bridge-wasm @kind logic */
import type { CheckGameId } from '@shared/game/data';

const isOverworldFactMet = (gameId: CheckGameId, readOwByte: (owScreen: number) => number): boolean => {
  const { owScreen, mask } = gameId;
  return owScreen !== undefined && mask !== undefined && (readOwByte(owScreen) & mask) !== 0;
};

export { isOverworldFactMet };
