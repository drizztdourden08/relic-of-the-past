/* @layer bridge-wasm @kind logic */
/**
 * The one writer of gate word 5 (features.h kFeatures5_*). Two owners share the word: the
 * capacity bonus (one bit, armed by a seed) and the story fields (armed by the settings, or
 * by a seed's own choices). Each owner hands its half here and the word is written whole,
 * so neither can clear the other's bits with a write of its own.
 */

import { log } from '../log-bus';
import { getModule } from './wasm-bridge';

const GATE_WORD = 5;

let capacityHalf = 0;
let storyHalf = 0;

const write = (): void => {
  const mod = getModule();
  if (!mod) return;
  // Guarded like every other gate-word write: a core built before this word carried bits has
  // no export to call.
  try {
    mod.ccall('WasmSetGateWord', null, ['number', 'number'], [GATE_WORD, (capacityHalf | storyHalf) >>> 0]);
  } catch {
    log.error('[Gate] this core has no gate word 5');
  }
};

const setCapacityHalf = (bits: number): void => {
  capacityHalf = bits;
  write();
};

const setStoryHalf = (bits: number): void => {
  storyHalf = bits;
  write();
};

/** Re-push the word after anything that clobbers WRAM (a save-state load). */
const reassertGateWord5 = (): void => write();

/** What the composer would write now: for tests and the log. */
const gateWord5Now = (): number => (capacityHalf | storyHalf) >>> 0;

export { gateWord5Now, reassertGateWord5, setCapacityHalf, setStoryHalf };
