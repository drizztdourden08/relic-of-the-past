/**
 * HID byte-level analysis algorithms — detect buttons, axes, counters from raw reports.
 */
import type { ButtonDiff } from './types';
import { ANALOG_THRESHOLD_DELTA } from './constants';

const popcount = (n: number) => {
  let c = 0;
  let v = n;
  while (v) { c += v & 1; v >>>= 1; }
  return c;
};

const findButtonBits = (bl: Uint8Array, pressed: Uint8Array, excluded: Set<number>): ButtonDiff[] => {
  const out: ButtonDiff[] = [];
  for (let i = 0; i < Math.min(bl.length, pressed.length); i++) {
    if (excluded.has(i)) continue;
    const xor = bl[i] ^ pressed[i];
    if (!xor) continue;
    const delta = Math.abs(pressed[i] - bl[i]);
    const isAnalog = delta >= ANALOG_THRESHOLD_DELTA && popcount(xor) > 3;
    out.push({ byteIndex: i, bitMask: xor, analog: isAnalog, restValue: bl[i], pressedValue: pressed[i] });
  }
  return out;
};

const findAxisBytes = (bl: Uint8Array, s: Uint8Array, excluded: Set<number>, minDelta = 30) => {
  const out: { byteIndex: number; baseVal: number; sampleVal: number }[] = [];
  for (let i = 0; i < Math.min(bl.length, s.length); i++) {
    if (excluded.has(i)) continue;
    if (Math.abs(s[i] - bl[i]) >= minDelta) {
      out.push({ byteIndex: i, baseVal: bl[i], sampleVal: s[i] });
    }
  }
  return out;
};

const findCounterBytes = (reports: Uint8Array[]): Set<number> => {
  const counters = new Set<number>();
  if (reports.length < 10) return counters;
  const len = reports[0].length;
  for (let i = 0; i < len; i++) {
    let changes = 0;
    let smallDeltas = 0;
    for (let r = 1; r < reports.length; r++) {
      if (reports[r][i] !== reports[r - 1][i]) {
        changes++;
        const d = (reports[r][i] - reports[r - 1][i] + 256) % 256;
        if (d <= 3 || d >= 253) smallDeltas++;
      }
    }
    const total = reports.length - 1;
    if (changes / total > 0.7 && smallDeltas / Math.max(changes, 1) > 0.6) {
      counters.add(i);
    }
  }
  return counters;
};

const hex = (b: number) => b.toString(16).padStart(2, '0');

export { findAxisBytes, findButtonBits, findCounterBytes, hex, popcount };
