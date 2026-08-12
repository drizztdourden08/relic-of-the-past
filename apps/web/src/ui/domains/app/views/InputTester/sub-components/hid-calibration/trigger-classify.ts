/* @layer renderer-components @kind logic */
/**
 * Is a trigger an axis or a switch?
 *
 * Both kinds exist across pads, so the answer has to be measured rather than
 * assumed. Range alone cannot tell them apart: a switch reported as one bit of
 * a shared button byte moves that byte by the bit's own value, so a high bit
 * looks exactly as wide as a real analog sweep.
 *
 * What separates them is how many distinct values the byte takes while it is
 * being worked. An analog trigger passes through a continuum on its way down
 * and back. A switch only ever reads pressed or released, and its difference
 * from rest is a single bit.
 */
import type { TriggerKind } from './hid-calibration.type';

/** At most this many distinct values and it cannot be a swept axis. */
const DIGITAL_MAX_UNIQUE = 4;
/** At least this many and it cannot be a two-state switch. */
const ANALOG_MIN_UNIQUE = 8;

interface TriggerClassification {
  kind: TriggerKind;
  uniqueCount: number;
  /** Set only for 'digital': the single bit that changes against rest. */
  bitMask: number;
}

const isSingleBit = (v: number): boolean => v !== 0 && (v & (v - 1)) === 0;

/** Distinct values byte `idx` took across the recorded frames. */
const uniqueValuesAt = (frames: readonly Uint8Array[], idx: number): Set<number> => {
  const seen = new Set<number>();
  for (const f of frames) {
    if (idx < f.length) seen.add(f[idx]);
  }
  return seen;
};

/**
 * `frames` is the recording buffer, `baseline` the resting report. Returns
 * 'unknown' while the evidence is still ambiguous, so a caller can keep
 * sampling instead of committing to the wrong rule.
 */
const classifyTriggerByte = (frames: readonly Uint8Array[], baseline: Uint8Array, idx: number): TriggerClassification => {
  const uniques = uniqueValuesAt(frames, idx);
  const uniqueCount = uniques.size;
  const rest = idx < baseline.length ? baseline[idx] : 0;

  // Every value seen must differ from rest by the same single bit for this to
  // be a switch. Other bits in a shared byte belong to other buttons, so any
  // value that is not rest and not rest-plus-that-bit rules it out.
  let bitMask = 0;
  let digitalConsistent = true;
  for (const v of uniques) {
    if (v === rest) continue;
    const delta = v ^ rest;
    if (!isSingleBit(delta)) { digitalConsistent = false; break; }
    if (bitMask === 0) bitMask = delta;
    else if (bitMask !== delta) { digitalConsistent = false; break; }
  }

  if (digitalConsistent && bitMask !== 0 && uniqueCount <= DIGITAL_MAX_UNIQUE) {
    return { kind: 'digital', uniqueCount, bitMask };
  }
  if (uniqueCount >= ANALOG_MIN_UNIQUE) {
    return { kind: 'analog', uniqueCount, bitMask: 0 };
  }
  return { kind: 'unknown', uniqueCount, bitMask: 0 };
};

export { classifyTriggerByte };
export type { TriggerClassification };
