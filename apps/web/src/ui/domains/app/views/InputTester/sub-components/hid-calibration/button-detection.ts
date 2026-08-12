/* @layer renderer-components @kind logic */
/**
 * Button and axis detection from raw HID report frames.
 * Handles the waiting-press / confirming-press / waiting-release state machine.
 */
import type { AxisSubStep, CaptureState, HidAxisMapping, HidButtonMapping, InputItem } from './hid-calibration.type';
import { CONFIRM_FRAMES } from './hid-calibration.constants';
import { buildButtonMapping, describeButtonMapping, findAxisBytes, findButtonBits, pickBestButtonDiff } from './hid-analysis';
import { ignoredForDetection } from './noisy-bytes';
import type { NoiseTracker } from './noisy-bytes';

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
  noiseRef: React.MutableRefObject<NoiseTracker>;
  /** Set whenever a button item becomes active. The next frame is spent
   *  recording what already differs from rest rather than accepting anything,
   *  which is what stops a still-held previous button from being read as this
   *  item's answer. */
  awaitingButtonRestRef: React.MutableRefObject<boolean>;
  /** Diff keys already present when the active item was selected. See processButtonItem. */
  heldAtActivationRef: React.MutableRefObject<Set<string>>;
  lastDetectLogAtRef: React.MutableRefObject<number>;
}

interface ButtonCallbacks {
  setCaptureState: (s: CaptureState) => void;
  setAxisSubStep: (s: AxisSubStep) => void;
  setItems: (updater: (prev: InputItem[]) => InputItem[]) => void;
  addLog: (msg: string) => void;
  updateByteStatuses: (len: number) => void;
  doAdvance: () => void;
}

const diffKey = (d: { byteIndex: number; bitMask: number }): string => `${d.byteIndex}:${d.bitMask}`;

/**
 * Button capture: press once and it goes to the next prompt, the same feel as
 * positional capture. No confirm-frame wait and no explicit release wait, so a
 * single frame is enough to record. What keeps a lingering previous press out
 * of this item's answer is the snapshot of what was already differing when the
 * item became active, not a wait for the report to go quiet.
 */
const processButtonItem = (bytes: Uint8Array, item: InputItem, idx: number, refs: ButtonRefs, cb: ButtonCallbacks): void => {
  if (item.status === 'captured' || item.status === 'skipped') return;
  const bl = refs.baselineRef.current;
  const excl = ignoredForDetection(refs.excludedRef.current, refs.noiseRef.current);
  const diffs = findButtonBits(bl, bytes, excl);

  // What was already differing the moment this item became active is not this
  // item's answer: a previous button still being held, or a report that simply
  // never reads clean. Recorded once, then filtered out, so a press is a bit
  // that ARRIVES rather than a moment when the whole report falls silent.
  // Waiting for silence cannot work: reports with a counter or timestamp byte
  // never provide one, and the capture would hang forever with no explanation.
  if (refs.awaitingButtonRestRef.current) {
    refs.heldAtActivationRef.current = new Set(diffs.map(diffKey));
    refs.awaitingButtonRestRef.current = false;
    // Says out loud what this item is comparing against. A capture that reads
    // as doing nothing is almost always one of these three being wrong: no
    // baseline to diff, the byte carrying the input excluded, or the byte
    // written off as restless.
    cb.addLog(`[detect] ${item.label}: baseline=${bl.length}B excluded=[${[...refs.excludedRef.current].sort((a, b) => a - b).join(',')}] restless=[${[...refs.noiseRef.current.noisy].sort((a, b) => a - b).join(',')}] alreadyDiffering=[${[...refs.heldAtActivationRef.current].join(' ')}]`);
    return;
  }

  const held = refs.heldAtActivationRef.current;
  const fresh = diffs.filter((d) => !held.has(diffKey(d)));
  if (fresh.length === 0) {
    // Something moved but every candidate was filtered, which is the exact
    // shape of a capture that silently never completes. Reported at most once
    // a second so holding a button cannot flood the log.
    if (diffs.length > 0 && Date.now() - refs.lastDetectLogAtRef.current > 1000) {
      refs.lastDetectLogAtRef.current = Date.now();
      cb.addLog(`[detect] ${item.label}: ${diffs.length} byte(s) changed but all filtered — [${diffs.map(diffKey).join(' ')}]`);
    }
    return;
  }
  const best = pickBestButtonDiff(fresh);
  const mapping = buildButtonMapping(best);
  const result = describeButtonMapping(mapping);
  cb.addLog(`✓ ${item.label}: ${result}`);
  cb.setItems(prev => prev.map((it, i) => i === idx ? { ...it, status: 'captured' as const, result, mapping } : it));
  cb.updateByteStatuses(bytes.length);
  if (refs.autoAdvanceRef.current) {
    if (refs.advanceTimerRef.current) clearTimeout(refs.advanceTimerRef.current);
    refs.advanceTimerRef.current = setTimeout(() => cb.doAdvance(), 150);
  }
};

const processButtonFrame = (bytes: Uint8Array, refs: ButtonRefs, cb: ButtonCallbacks): void => {
  if (!refs.inputPhaseActiveRef.current) return;
  const idx = refs.activeIdxRef.current;
  const item = refs.itemsRef.current[idx];
  if (!item) return;
  if (item.kind === 'button') { processButtonItem(bytes, item, idx, refs, cb); return; }
  if ((item.status === 'captured' || item.status === 'skipped') && refs.captureStateRef.current !== 'waiting-release') return;
  const bl = refs.baselineRef.current;
  // Same reason as the button path: waiting-release only completes on a frame
  // with no differences left, which a restless byte would never allow.
  const excl = ignoredForDetection(refs.excludedRef.current, refs.noiseRef.current);
  const captureState = refs.captureStateRef.current;
  if (captureState === 'waiting-press') processWaitingPress(bytes, bl, excl, item, refs, cb);
  else if (captureState === 'confirming-press') processConfirmingPress(bytes, bl, excl, item, idx, refs, cb);
  else if (captureState === 'waiting-release') processWaitingRelease(bytes, bl, excl, item, idx, refs, cb);
};

// ── Axis capture (unchanged: pos/neg two-step, confirm-frames, release-wait) ──

const processWaitingPress = (bytes: Uint8Array, bl: Uint8Array, excl: Set<number>, item: InputItem, refs: ButtonRefs, cb: ButtonCallbacks): void => {
  refs.releaseCountRef.current = 0;
  refs.confirmCountRef.current = 0;
  refs.detectedBtnRef.current = null;
  const diffs = findAxisBytes(bl, bytes, excl, 30);
  if (diffs.length > 0) {
    refs.detectedBtnRef.current = { byteIndex: diffs[0].byteIndex, bitMask: 0 };
    refs.confirmCountRef.current = 1;
    cb.setCaptureState('confirming-press');
  }
};

const processConfirmingPress = (bytes: Uint8Array, bl: Uint8Array, excl: Set<number>, item: InputItem, idx: number, refs: ButtonRefs, cb: ButtonCallbacks): void => {
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
};

const processWaitingRelease = (bytes: Uint8Array, bl: Uint8Array, excl: Set<number>, item: InputItem, idx: number, refs: ButtonRefs, cb: ButtonCallbacks): void => {
  const released = findAxisBytes(bl, bytes, excl, 10).length === 0;
  if (!released) { refs.releaseCountRef.current = 0; return; }
  refs.releaseCountRef.current++;
  if (refs.releaseCountRef.current < 3) return;

  const sub = refs.axisSubStepRef.current;
  if (sub === 'pos') {
    cb.setAxisSubStep('neg');
    cb.setCaptureState('waiting-press');
    refs.releaseCountRef.current = 0;
  } else {
    finalizeAxisCapture(bytes, bl, excl, item, idx, refs, cb);
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
