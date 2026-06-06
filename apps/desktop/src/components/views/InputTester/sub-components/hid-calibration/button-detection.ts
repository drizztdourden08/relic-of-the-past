/**
 * Button and axis detection from raw HID report frames.
 * Handles the waiting-press / confirming-press / waiting-release state machine.
 */
import type { AxisSubStep, ButtonDiff, CaptureState, HidAxisMapping, HidButtonMapping, InputItem } from './types';
import { ANALOG_THRESHOLD_DELTA, CONFIRM_FRAMES } from './constants';
import { findAxisBytes, findButtonBits, popcount } from './hid-analysis';

interface ButtonRefs {
  activeIdxRef: React.MutableRefObject<number>;
  captureStateRef: React.MutableRefObject<CaptureState>;
  axisSubStepRef: React.MutableRefObject<AxisSubStep>;
  itemsRef: React.MutableRefObject<InputItem[]>;
  releaseCountRef: React.MutableRefObject<number>;
  detectedBtnRef: React.MutableRefObject<HidButtonMapping | null>;
  confirmCountRef: React.MutableRefObject<number>;
  axisCapRef: React.MutableRefObject<Record<string, { posBytes: Uint8Array | null; negBytes: Uint8Array | null }>>;
  advanceTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  autoAdvanceRef: React.MutableRefObject<boolean>;
  inputPhaseActiveRef: React.MutableRefObject<boolean>;
  baselineRef: React.MutableRefObject<Uint8Array>;
  excludedRef: React.MutableRefObject<Set<number>>;
}

interface ButtonCallbacks {
  setCaptureState: (s: CaptureState) => void;
  setAxisSubStep: (s: AxisSubStep) => void;
  setItems: (updater: (prev: InputItem[]) => InputItem[]) => void;
  addLog: (msg: string) => void;
  updateByteStatuses: (len: number) => void;
  doAdvance: () => void;
}

const processButtonFrame = (bytes: Uint8Array, refs: ButtonRefs, cb: ButtonCallbacks): void => {
  if (!refs.inputPhaseActiveRef.current) return;
  const idx = refs.activeIdxRef.current;
  const item = refs.itemsRef.current[idx];
  if (!item) return;
  if ((item.status === 'captured' || item.status === 'skipped') && refs.captureStateRef.current !== 'waiting-release') return;
  const bl = refs.baselineRef.current;
  const excl = refs.excludedRef.current;
  const captureState = refs.captureStateRef.current;
  if (captureState === 'waiting-press') processWaitingPress(bytes, bl, excl, item, refs, cb);
  else if (captureState === 'confirming-press') processConfirmingPress(bytes, bl, excl, item, idx, refs, cb);
  else if (captureState === 'waiting-release') processWaitingRelease(bytes, bl, excl, item, idx, refs, cb);
};

const processWaitingPress = (bytes: Uint8Array, bl: Uint8Array, excl: Set<number>, item: InputItem, refs: ButtonRefs, cb: ButtonCallbacks): void => {
  refs.releaseCountRef.current = 0;
  refs.confirmCountRef.current = 0;
  refs.detectedBtnRef.current = null;
  if (item.kind === 'button') {
    const diffs = findButtonBits(bl, bytes, excl);
    if (diffs.length > 0) {
      const digital = diffs.filter(d => !d.analog);
      const analog = diffs.filter(d => d.analog);
      let best: ButtonDiff;
      if (digital.length > 0) {
        best = digital[0];
        for (const d of digital) { if (popcount(d.bitMask) < popcount(best.bitMask)) best = d; }
      } else {
        best = analog[0];
        for (const d of analog) { if (Math.abs(d.pressedValue - d.restValue) > Math.abs(best.pressedValue - best.restValue)) best = d; }
      }
      if (best.analog) {
        const threshold = best.restValue + Math.floor(Math.abs(best.pressedValue - best.restValue) / 3);
        refs.detectedBtnRef.current = { byteIndex: best.byteIndex, bitMask: 0xFF, threshold, restValue: best.restValue };
      } else {
        refs.detectedBtnRef.current = { byteIndex: best.byteIndex, bitMask: best.bitMask };
      }
      refs.confirmCountRef.current = 1;
      cb.setCaptureState('confirming-press');
    }
  }
  if (item.kind === 'axis') {
    const diffs = findAxisBytes(bl, bytes, excl, 30);
    if (diffs.length > 0) {
      refs.detectedBtnRef.current = { byteIndex: diffs[0].byteIndex, bitMask: 0 };
      refs.confirmCountRef.current = 1;
      cb.setCaptureState('confirming-press');
    }
  }
};

const processConfirmingPress = (bytes: Uint8Array, bl: Uint8Array, excl: Set<number>, item: InputItem, idx: number, refs: ButtonRefs, cb: ButtonCallbacks): void => {
  if (item.kind === 'button') {
    const prev = refs.detectedBtnRef.current;
    let stillHeld = false;
    if (prev && prev.threshold != null) {
      stillHeld = Math.abs(bytes[prev.byteIndex] - (prev.restValue ?? bl[prev.byteIndex])) >= ANALOG_THRESHOLD_DELTA;
    } else if (prev) {
      const diffs = findButtonBits(bl, bytes, excl);
      stillHeld = diffs.some(d => d.byteIndex === prev.byteIndex && d.bitMask === prev.bitMask);
    }
    if (stillHeld) {
      refs.confirmCountRef.current++;
      if (refs.confirmCountRef.current >= CONFIRM_FRAMES) {
        const isAnalog = prev!.threshold != null;
        const result = isAnalog
          ? `byte[${prev!.byteIndex}] analog (rest=${prev!.restValue}, threshold=${prev!.threshold})`
          : `byte[${prev!.byteIndex}] & 0x${prev!.bitMask.toString(16).padStart(2, '0')}`;
        cb.addLog(`✓ ${item.label}: ${result}`);
        cb.setItems(prev2 => prev2.map((it, i) => i === idx ? { ...it, status: 'captured' as const, result, mapping: prev! } : it));
        cb.setCaptureState('waiting-release');
        cb.updateByteStatuses(bytes.length);
      }
    } else {
      refs.confirmCountRef.current = 0;
      refs.detectedBtnRef.current = null;
      cb.setCaptureState('waiting-press');
    }
  }
  if (item.kind === 'axis') {
    const diffs = findAxisBytes(bl, bytes, excl, 30);
    if (diffs.length > 0) {
      refs.confirmCountRef.current++;
      if (refs.confirmCountRef.current >= CONFIRM_FRAMES) {
        const axisId = item.id;
        if (!refs.axisCapRef.current[axisId]) refs.axisCapRef.current[axisId] = { posBytes: null, negBytes: null };
        const sub = refs.axisSubStepRef.current;
        if (sub === 'pos') {
          refs.axisCapRef.current[axisId].posBytes = new Uint8Array(bytes);
          cb.addLog(`✓ ${item.label}+ — ${diffs.map(d => `[${d.byteIndex}]:${d.baseVal}→${d.sampleVal}`).join(', ')}`);
        } else {
          refs.axisCapRef.current[axisId].negBytes = new Uint8Array(bytes);
          cb.addLog(`✓ ${item.label}− — ${diffs.map(d => `[${d.byteIndex}]:${d.baseVal}→${d.sampleVal}`).join(', ')}`);
        }
        cb.setCaptureState('waiting-release');
      }
    } else {
      refs.confirmCountRef.current = 0;
      refs.detectedBtnRef.current = null;
      cb.setCaptureState('waiting-press');
    }
  }
};

const processWaitingRelease = (bytes: Uint8Array, bl: Uint8Array, excl: Set<number>, item: InputItem, idx: number, refs: ButtonRefs, cb: ButtonCallbacks): void => {
  let released = false;
  if (item.kind === 'button') {
    const m = refs.detectedBtnRef.current;
    if (m && m.threshold != null) {
      released = Math.abs(bytes[m.byteIndex] - (m.restValue ?? bl[m.byteIndex])) < ANALOG_THRESHOLD_DELTA / 2;
    } else if (m) {
      released = (bytes[m.byteIndex] & m.bitMask) === (bl[m.byteIndex] & m.bitMask);
    }
  } else {
    released = findAxisBytes(bl, bytes, excl, 10).length === 0;
  }
  if (!released) { refs.releaseCountRef.current = 0; return; }
  refs.releaseCountRef.current++;
  if (refs.releaseCountRef.current < 3) return;

  if (item.kind === 'button') {
    if (refs.autoAdvanceRef.current) {
      if (refs.advanceTimerRef.current) clearTimeout(refs.advanceTimerRef.current);
      refs.advanceTimerRef.current = setTimeout(() => cb.doAdvance(), 150);
    } else {
      cb.setCaptureState('waiting-press');
    }
  } else {
    const sub = refs.axisSubStepRef.current;
    if (sub === 'pos') {
      cb.setAxisSubStep('neg');
      cb.setCaptureState('waiting-press');
      refs.releaseCountRef.current = 0;
    } else {
      finalizeAxisCapture(bytes, bl, excl, item, idx, refs, cb);
    }
  }
};

const finalizeAxisCapture = (bytes: Uint8Array, bl: Uint8Array, excl: Set<number>, item: InputItem, idx: number, refs: ButtonRefs, cb: ButtonCallbacks): void => {
  const ac = refs.axisCapRef.current[item.id];
  if (ac?.posBytes && ac?.negBytes) {
    const posD = findAxisBytes(bl, ac.posBytes, excl, 5);
    const negD = findAxisBytes(bl, ac.negBytes, excl, 5);
    const allB = new Set([...posD.map(d => d.byteIndex), ...negD.map(d => d.byteIndex)]);
    let bestByte = -1, bestRange = 0;
    for (const bi of allB) {
      const r = Math.abs(ac.posBytes[bi] - ac.negBytes[bi]);
      if (r > bestRange) { bestRange = r; bestByte = bi; }
    }
    if (bestByte >= 0) {
      const posVal = ac.posBytes[bestByte], negVal = ac.negBytes[bestByte];
      const centerVal = bl[bestByte];
      const inverted = posVal < negVal;
      const axisMapping: HidAxisMapping = { byteIndex: bestByte, center: centerVal, min: Math.min(posVal, negVal), max: Math.max(posVal, negVal), inverted };
      const result = `byte[${bestByte}] ${axisMapping.min}..${centerVal}..${axisMapping.max}${inverted ? ' inv' : ''}`;
      cb.addLog(`✓ ${item.label}: ${result}`);
      cb.setItems(prev => prev.map((it, i) => i === idx ? { ...it, status: 'captured' as const, result, axisMapping } : it));
      cb.updateByteStatuses(bytes.length);
    } else {
      cb.addLog(`⚠ No axis data for ${item.label}`);
      cb.setItems(prev => prev.map((it, i) => i === idx ? { ...it, status: 'skipped' as const, result: 'no data' } : it));
    }
  }
  if (refs.autoAdvanceRef.current) {
    if (refs.advanceTimerRef.current) clearTimeout(refs.advanceTimerRef.current);
    refs.advanceTimerRef.current = setTimeout(() => cb.doAdvance(), 150);
  } else {
    cb.setCaptureState('waiting-press');
  }
};

export { processButtonFrame };
export type { ButtonRefs, ButtonCallbacks };
