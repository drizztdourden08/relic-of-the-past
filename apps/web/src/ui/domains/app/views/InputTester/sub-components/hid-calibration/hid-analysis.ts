/* @layer renderer-components @kind logic */
/**
 * HID byte-level analysis. Detects buttons, axes and counters from raw reports.
 */
import type { ButtonDiff, HidButtonMapping } from './hid-calibration.type';
import { ANALOG_THRESHOLD_DELTA } from './hid-calibration.constants';

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

/** The most likely intended answer among several bytes that changed at once:
 *  the smallest digital bitmask (fewest incidental bits), or failing that the
 *  analog byte that moved the furthest from rest. */
const pickBestButtonDiff = (diffs: ButtonDiff[]): ButtonDiff => {
  const digital = diffs.filter(d => !d.analog);
  const analog = diffs.filter(d => d.analog);
  if (digital.length > 0) {
    let best = digital[0];
    for (const d of digital) { if (popcount(d.bitMask) < popcount(best.bitMask)) best = d; }
    return best;
  }
  let best = analog[0];
  for (const d of analog) { if (Math.abs(d.pressedValue - d.restValue) > Math.abs(best.pressedValue - best.restValue)) best = d; }
  return best;
};

const buildButtonMapping = (best: ButtonDiff): HidButtonMapping => {
  if (best.analog) {
    const threshold = best.restValue + Math.floor(Math.abs(best.pressedValue - best.restValue) / 3);
    return { byteIndex: best.byteIndex, bitMask: 0xFF, threshold, restValue: best.restValue };
  }
  return { byteIndex: best.byteIndex, bitMask: best.bitMask };
};

const describeButtonMapping = (m: HidButtonMapping): string =>
  m.threshold != null
    ? `byte[${m.byteIndex}] analog (rest=${m.restValue}, threshold=${m.threshold})`
    : `byte[${m.byteIndex}] & 0x${m.bitMask.toString(16).padStart(2, '0')}`;

export { buildButtonMapping, describeButtonMapping, findAxisBytes, findButtonBits, findCounterBytes, hex, pickBestButtonDiff, popcount };
