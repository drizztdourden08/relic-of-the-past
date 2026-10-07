/* @layer bridge-wasm @kind logic */
/**
 * The per-check completion sweep, shared by the live poller (flag-polling.ts)
 * and the offline battery-save reader (save-file/offline-progress.ts): every
 * check record is tested against whichever of its own gameId fields describe
 * a detection mode. A null reader stands for a source that is not available
 * (a gated live query, the offline path's missing live-WRAM byte) and skips
 * its modes instead of reading zeros, since zero can satisfy an equality
 * threshold, so a fabricated read is not a safe "no".
 */
import { all } from '@shared/game/data';
import type { CheckId } from '@shared/game/data';
import { isOutOfBedFallbackMet, isOverworldFactMet, isProgressFactMet, isRoomFactMet } from './check-facts';
import { completionBitOf } from '../randomizer-client/randomizer-completion-bits';

interface ProgressReaders {
  readRoomWord: ((roomId: number) => number) | null;
  readOwByte: ((owScreen: number) => number) | null;
  readProgByte: ((bufferIndex: number) => number) | null;
}

const computeCompletedChecks = (
  readers: ProgressReaders,
  isArmed: (checkId: string) => boolean,
): Set<CheckId> => {
  const { readRoomWord, readOwByte, readProgByte } = readers;
  const completed = new Set<CheckId>();
  for (const check of all('check')) {
    const { gameId } = check;
    // A physically armed substitution row must never complete off its record's
    // possession-proxy detection: the vanilla item can arrive from anywhere in a
    // shuffled seed. The substitution seam persists the REAL taken-bit instead
    // (progress bytes 21/22); vanilla profiles never arm, so they keep the proxy.
    const realBit = completionBitOf(check.id);
    if (realBit !== undefined && isArmed(check.id)) {
      if (readProgByte && (readProgByte(realBit.bufferIndex) & realBit.mask) !== 0) {
        completed.add(check.id);
      }
      continue;
    }
    if (readRoomWord && isRoomFactMet(gameId, readRoomWord)) {
      completed.add(check.id);
    } else if (readOwByte && isOverworldFactMet(gameId, readOwByte)) {
      completed.add(check.id);
    } else if (readProgByte && (isProgressFactMet(gameId, readProgByte) || isOutOfBedFallbackMet(gameId, readProgByte))) {
      completed.add(check.id);
    }
  }
  return completed;
};

export { computeCompletedChecks };
export type { ProgressReaders };
