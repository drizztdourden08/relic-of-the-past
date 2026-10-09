/* @layer bridge-wasm @kind logic */
import { all } from '@rotp/game-data';
import type { CheckId } from '@rotp/game-data';
import { isEventFactMet, isOutOfBedFallbackMet, isOverworldFactMet, isProgressFactMet, isRoomFactMet } from './check-facts';
import { resolveDerivedChecks } from './derived-checks';
import { completionBitOf } from '../randomizer-client/randomizer-completion-bits';
import type { ProgressReaders } from './completed-checks-core.type';

const computeCompletedChecks = (
  readers: ProgressReaders,
  isArmed: (checkId: string) => boolean,
): Set<CheckId> => {
  const { readRoomWord, readOwByte, readProgByte, readEventByte = null, inventory = null } = readers;
  const completed = new Set<CheckId>();
  const armed = new Set<CheckId>();
  const checks = all('check');
  for (const check of checks) {
    const { gameId } = check;
    const realBit = completionBitOf(check.id);
    if (realBit !== undefined && isArmed(check.id)) {
      if (readProgByte && (readProgByte(realBit.bufferIndex) & realBit.mask) !== 0) {
        completed.add(check.id);
      }
      armed.add(check.id);
      continue;
    }
    if (readRoomWord && isRoomFactMet(gameId, readRoomWord)) {
      completed.add(check.id);
    } else if (readOwByte && isOverworldFactMet(gameId, readOwByte)) {
      completed.add(check.id);
    } else if (readProgByte && (isProgressFactMet(gameId, readProgByte) || isOutOfBedFallbackMet(gameId, readProgByte))) {
      completed.add(check.id);
    } else if (readEventByte && isEventFactMet(gameId, readEventByte)) {
      completed.add(check.id);
    }
  }
  return resolveDerivedChecks(completed, inventory, checks, armed);
};

export { computeCompletedChecks };
export type { ProgressReaders } from './completed-checks-core.type';
