/* @layer renderer-components @kind logic */
import { ANALOG_MIN_UNIQUE, DIGITAL_MAX_UNIQUE } from './trigger-classify.constants';
import type { TriggerClassification } from './trigger-classify.type';

const isSingleBit = (v: number): boolean => v !== 0 && (v & (v - 1)) === 0;

const uniqueValuesAt = (frames: readonly Uint8Array[], idx: number): Set<number> => {
  const seen = new Set<number>();
  for (const f of frames) {
    if (idx < f.length) seen.add(f[idx]);
  }
  return seen;
};

const singleBitAgainstRest = (uniques: Set<number>, rest: number): number | null => {
  let bitMask = 0;
  for (const v of uniques) {
    if (v === rest) continue;
    const delta = v ^ rest;
    if (!isSingleBit(delta)) return null;
    if (bitMask === 0) bitMask = delta;
    else if (bitMask !== delta) return null;
  }
  return bitMask;
};

const classifyTriggerByte = (frames: readonly Uint8Array[], baseline: Uint8Array, idx: number): TriggerClassification => {
  const uniques = uniqueValuesAt(frames, idx);
  const uniqueCount = uniques.size;
  const rest = idx < baseline.length ? baseline[idx] : 0;
  const bitMask = singleBitAgainstRest(uniques, rest);

  if (bitMask !== null && bitMask !== 0 && uniqueCount <= DIGITAL_MAX_UNIQUE) {
    return { kind: 'digital', uniqueCount, bitMask };
  }
  if (uniqueCount >= ANALOG_MIN_UNIQUE) {
    return { kind: 'analog', uniqueCount, bitMask: 0 };
  }
  return { kind: 'unknown', uniqueCount, bitMask: 0 };
};

export { classifyTriggerByte };
