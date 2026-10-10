/* @layer bridge-wasm @kind logic */
import { all } from '@rotp/game-data';
import type { CheckGameId, CheckId } from '@rotp/game-data';
import { isEventFactMet, isOutOfBedFallbackMet, isOverworldFactMet, isProgressFactMet, isRoomFactMet } from './check-facts';
import { resolveDerivedChecks } from './derived-checks';
import { completionBitOf } from '@rotp/randomizer';
import type { ProgressReaders } from './completed-checks-core.type';

const isFlagFactMet = (gameId: CheckGameId, readers: ProgressReaders): boolean => {
  const { readRoomWord, readOwByte } = readers;
  if (readRoomWord && isRoomFactMet(gameId, readRoomWord)) return true;
  return Boolean(readOwByte && isOverworldFactMet(gameId, readOwByte));
};

const isProgressOrEventMet = (gameId: CheckGameId, readers: ProgressReaders): boolean => {
  const { readProgByte, readEventByte = null } = readers;
  if (readProgByte && (isProgressFactMet(gameId, readProgByte) || isOutOfBedFallbackMet(gameId, readProgByte))) return true;
  return Boolean(readEventByte && isEventFactMet(gameId, readEventByte));
};

const computeCompletedChecks = (
  readers: ProgressReaders,
  isArmed: (checkId: string) => boolean,
): Set<CheckId> => {
  const { readProgByte, inventory = null } = readers;
  const completed = new Set<CheckId>();
  const armed = new Set<CheckId>();
  const checks = all('check');
  for (const check of checks) {
    const { gameId } = check;
    const realBit = completionBitOf(check.id);
    if (realBit !== undefined && isArmed(check.id)) {
      if (readProgByte && (readProgByte(realBit.bufferIndex) & realBit.mask) !== 0) completed.add(check.id);
      armed.add(check.id);
      continue;
    }
    if (isFlagFactMet(gameId, readers) || isProgressOrEventMet(gameId, readers)) completed.add(check.id);
  }
  return resolveDerivedChecks(completed, inventory, checks, armed);
};

export { computeCompletedChecks };
export type { ProgressReaders } from './completed-checks-core.type';
