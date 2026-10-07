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
import type { CheckId, ItemId } from '@shared/game/data';
import { isEventFactMet, isOutOfBedFallbackMet, isOverworldFactMet, isProgressFactMet, isRoomFactMet } from './check-facts';
import { resolveDerivedChecks } from './derived-checks';
import { completionBitOf } from '../randomizer-client/randomizer-completion-bits';

interface ProgressReaders {
  readRoomWord: ((roomId: number) => number) | null;
  readOwByte: ((owScreen: number) => number) | null;
  readProgByte: ((bufferIndex: number) => number) | null;
  /** The event ledger bytes (WasmGetEventBytes, or the battery file's own copy). */
  readEventByte?: ((byteIndex: number) => number) | null;
  /** Items held, for the derived pass's held-item events; null skips them. */
  inventory?: ReadonlySet<ItemId> | null;
}

const computeCompletedChecks = (
  readers: ProgressReaders,
  isArmed: (checkId: string) => boolean,
): Set<CheckId> => {
  const { readRoomWord, readOwByte, readProgByte, readEventByte = null, inventory = null } = readers;
  const completed = new Set<CheckId>();
  // Armed rows answer from their own taken-bit alone: a fallback that reads the vanilla item
  // would tick them the moment that item turned up anywhere on the seed.
  const armed = new Set<CheckId>();
  const checks = all('check');
  for (const check of checks) {
    const { gameId } = check;
    // A physically armed substitution row must never complete off its record's
    // possession-proxy detection: the vanilla item can arrive from anywhere in a
    // shuffled seed. The substitution seam persists the REAL taken-bit instead
    // (progress bytes 21/22); normal profiles never arm, so they keep the proxy.
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
export type { ProgressReaders };
