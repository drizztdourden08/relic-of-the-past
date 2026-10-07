/* @layer bridge-wasm @kind logic */
/**
 * The one writer of gate word 5 (features.h kFeatures5_*). Four owners share the word: the
 * capacity bonus (one bit, armed by a seed), the story fields (armed by the settings, or by a
 * seed's own choices), the online bits (armed by a multiworld session for its lifetime) and the
 * quiet receipt bits (the settings, pushed with the rest of the live settings).
 * Each owner hands its part here and the word is written whole, so none can clear another's
 * bits with a write of its own.
 */

import { DEFAULT_STORY_WORD } from '@shared/randomizer/world/story-gates/story-gate-word';
import { QUIET_RECEIPT_KINDS } from '@shared/game/quiet-receipts';
import type { QuietReceiptKind } from '@shared/game/quiet-receipts';
import { log } from '../log-bus';
import { getModule } from './wasm-bridge';

const GATE_WORD = 5;

/** kFeatures5_ApOnline: the foreign-item sentinel is a grant id. */
const AP_ONLINE_BIT = 1 << 26;
/** kFeatures5_ApDeathLink: a death is reported, and a room death can be armed. */
const AP_DEATH_LINK_BIT = 1 << 27;
/** kFeatures5_QuietRupees / QuietBombs / QuietArrows: a delivered one skips its hold-up and message. */
const QUIET_RECEIPT_BITS: Readonly<Record<QuietReceiptKind, number>> = {
  rupees: 1 << 28,
  bombs: 1 << 29,
  arrows: 1 << 30,
};

let capacityHalf = 0;
// The story half starts as the default every profile arms, so a word written before the first
// settings push (a state load, the capacity half) never lands with the ledger off.
let storyHalf = DEFAULT_STORY_WORD;
let onlineBits = 0;
let quietBit = 0;

const composed = (): number => (capacityHalf | storyHalf | onlineBits | quietBit) >>> 0;

const write = (): void => {
  const mod = getModule();
  if (!mod) return;
  // Guarded like every other gate-word write: a core built before this word carried bits has
  // no export to call.
  try {
    mod.ccall('WasmSetGateWord', null, ['number', 'number'], [GATE_WORD, composed()]);
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

/** The online session's bits; 0 hands the word back to the other owners alone. */
const setOnlineBits = (bits: number): void => {
  onlineBits = bits & (AP_ONLINE_BIT | AP_DEATH_LINK_BIT);
  write();
};

/** The quiet receipt settings; written only when they change, since every settings push calls it. */
const setQuietReceiptBits = (on: Readonly<Record<QuietReceiptKind, boolean>>): void => {
  const next = QUIET_RECEIPT_KINDS.reduce((bits, kind) => (on[kind] ? bits | QUIET_RECEIPT_BITS[kind] : bits), 0);
  if (next === quietBit) return;
  quietBit = next;
  write();
};

/** Re-push the word after anything that clobbers WRAM (a save-state load). */
const reassertGateWord5 = (): void => write();

/** What the composer would write now: for tests and the log. */
const gateWord5Now = (): number => composed();

export {
  AP_DEATH_LINK_BIT, AP_ONLINE_BIT, gateWord5Now, QUIET_RECEIPT_BITS, reassertGateWord5, setCapacityHalf, setOnlineBits,
  setQuietReceiptBits, setStoryHalf,
};
