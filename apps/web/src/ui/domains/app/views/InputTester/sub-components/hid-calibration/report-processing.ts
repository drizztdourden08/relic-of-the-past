/* @layer renderer-components @kind logic */
/**
 * Signal processing for gyro, stick, and trigger calibration frames.
 * Called from the report subscription effect in useHidCalibration.
 */
import type { HidButtonMapping, StickCandidate } from './hid-calibration.type';
import { STICK_RANGE_THRESHOLD, STICK_STABLE_FRAMES, TRIGGER_RANGE_THRESHOLD, TRIGGER_STABLE_FRAMES } from './hid-calibration.constants';
import { findCounterBytes } from './hid-analysis';
import { classifyTriggerByte } from './trigger-classify';
import { reclaimGyroExcludedStickBytes, shouldAttemptGyroReclaim } from './stick-gyro-reclaim';
import type { GyroReclaimRefs } from './stick-gyro-reclaim';

// ── Gyro Processing ─────────────────────────────────────────────────────────

interface GyroRefs {
  gyroMinsRef: React.MutableRefObject<Uint8Array>;
  gyroMaxsRef: React.MutableRefObject<Uint8Array>;
  gyroBufferRef: React.MutableRefObject<Uint8Array[]>;
}

const processGyroFrame = (bytes: Uint8Array, refs: GyroRefs, onChangedUpdate: (changed: Set<number>) => void): void => {
  const len = bytes.length;
  const mins = refs.gyroMinsRef.current;
  const maxs = refs.gyroMaxsRef.current;
  for (let i = 0; i < len; i++) {
    if (bytes[i] < mins[i]) mins[i] = bytes[i];
    if (bytes[i] > maxs[i]) maxs[i] = bytes[i];
  }
  refs.gyroBufferRef.current.push(new Uint8Array(bytes));
  if (refs.gyroBufferRef.current.length > 200) refs.gyroBufferRef.current.shift();

  if (refs.gyroBufferRef.current.length % 5 === 0) {
    const changed = new Set<number>();
    for (let i = 0; i < len; i++) {
      if (maxs[i] !== mins[i]) changed.add(i);
    }
    onChangedUpdate(changed);
  }
};

// ── Stick Processing ────────────────────────────────────────────────────────

interface StickRefs extends GyroReclaimRefs {
  stickMinsRef: React.MutableRefObject<Uint8Array>;
  stickMaxsRef: React.MutableRefObject<Uint8Array>;
  stickCounterBytesRef: React.MutableRefObject<Set<number>>;
  stickSamplesRef: React.MutableRefObject<number>;
  stickStableCountRef: React.MutableRefObject<number>;
  stickLastTop2Ref: React.MutableRefObject<string>;
  stickBufferRef: React.MutableRefObject<Uint8Array[]>;
  capturedStickBytesRef: React.MutableRefObject<Set<number>>;
  baselineRef: React.MutableRefObject<Uint8Array>;
}

const processStickFrame = (bytes: Uint8Array, refs: StickRefs, onLiveInfo: (info: string) => void, onFinalize: (c1: StickCandidate, c2: StickCandidate | null) => void, onStopRecording: () => void, addLog: (msg: string) => void): void => {
  const len = bytes.length;
  const mins = refs.stickMinsRef.current;
  const maxs = refs.stickMaxsRef.current;
  for (let i = 0; i < len; i++) {
    if (bytes[i] < mins[i]) mins[i] = bytes[i];
    if (bytes[i] > maxs[i]) maxs[i] = bytes[i];
  }
  refs.stickSamplesRef.current++;
  refs.stickBufferRef.current.push(new Uint8Array(bytes));
  if (refs.stickBufferRef.current.length > 60) refs.stickBufferRef.current.shift();

  if (refs.stickSamplesRef.current % 5 !== 0) return;

  if (refs.stickBufferRef.current.length >= 20) {
    refs.stickCounterBytesRef.current = findCounterBytes(refs.stickBufferRef.current);
  }
  const ctrBytes = refs.stickCounterBytesRef.current;
  const candidates: StickCandidate[] = [];
  const prevStickBytes = refs.capturedStickBytesRef.current;
  for (let i = 0; i < len; i++) {
    if (prevStickBytes.has(i) || refs.excludedRef.current.has(i) || ctrBytes.has(i)) continue;
    const range = maxs[i] - mins[i];
    if (range >= 20) {
      candidates.push({ idx: i, range, min: mins[i], max: maxs[i], center: refs.baselineRef.current[i] ?? 128 });
    }
  }
  candidates.sort((a, b) => b.range - a.range);
  const top2 = candidates.slice(0, 2);

  if (shouldAttemptGyroReclaim(refs, top2.length)) {
    refs.stickReclaimAttemptedRef.current = true;
    reclaimGyroExcludedStickBytes(refs, mins, maxs, addLog);
    return;
  }

  if (top2.length >= 2) {
    onLiveInfo(`byte[${top2[0].idx}] range=${top2[0].range}  |  byte[${top2[1].idx}] range=${top2[1].range}`);
  } else if (top2.length === 1) {
    onLiveInfo(`byte[${top2[0].idx}] range=${top2[0].range}  |  waiting for 2nd axis...`);
  } else {
    onLiveInfo('No candidates yet. Keep rotating...');
  }

  const key = top2.map(c => `${c.idx}`).join(',');
  if (key === refs.stickLastTop2Ref.current) {
    refs.stickStableCountRef.current++;
  } else {
    refs.stickStableCountRef.current = 0;
    refs.stickLastTop2Ref.current = key;
  }

  if (top2.length >= 2 && top2[0].range >= STICK_RANGE_THRESHOLD && top2[1].range >= STICK_RANGE_THRESHOLD
      && refs.stickStableCountRef.current >= STICK_STABLE_FRAMES) {
    onStopRecording();
    onFinalize(top2[0], top2[1]);
  }
};

// ── Trigger Processing ──────────────────────────────────────────────────────

interface TriggerRefs {
  triggerMinsRef: React.MutableRefObject<Uint8Array>;
  triggerMaxsRef: React.MutableRefObject<Uint8Array>;
  triggerSamplesRef: React.MutableRefObject<number>;
  triggerStableCountRef: React.MutableRefObject<number>;
  triggerLastTopRef: React.MutableRefObject<string>;
  triggerBufferRef: React.MutableRefObject<Uint8Array[]>;
  capturedStickBytesRef: React.MutableRefObject<Set<number>>;
  capturedTriggerBytesRef: React.MutableRefObject<Set<number>>;
  excludedRef: React.MutableRefObject<Set<number>>;
  baselineRef: React.MutableRefObject<Uint8Array>;
}

const processTriggerFrame = (bytes: Uint8Array, refs: TriggerRefs, onLiveInfo: (info: string) => void, onFinalize: (c: StickCandidate) => void, onStopRecording: () => void, onFinalizeDigital: (mapping: HidButtonMapping) => void): void => {
  const len = bytes.length;
  const mins = refs.triggerMinsRef.current;
  const maxs = refs.triggerMaxsRef.current;
  for (let i = 0; i < len; i++) {
    if (bytes[i] < mins[i]) mins[i] = bytes[i];
    if (bytes[i] > maxs[i]) maxs[i] = bytes[i];
  }
  refs.triggerSamplesRef.current++;
  refs.triggerBufferRef.current.push(new Uint8Array(bytes));
  if (refs.triggerBufferRef.current.length > 40) refs.triggerBufferRef.current.shift();

  if (refs.triggerSamplesRef.current % 5 !== 0) return;

  // Floor of 2, not 15: a switch reported as one bit moves its byte by only
  // that bit's value, and the low bits are worth as much as the high ones.
  // Which kind it is gets decided by classification below, never by width.
  const candidates: StickCandidate[] = [];
  for (let i = 0; i < len; i++) {
    if (refs.capturedStickBytesRef.current.has(i) || refs.capturedTriggerBytesRef.current.has(i) || refs.excludedRef.current.has(i)) continue;
    const range = maxs[i] - mins[i];
    if (range >= 2) {
      candidates.push({ idx: i, range, min: mins[i], max: maxs[i], center: refs.baselineRef.current[i] ?? 0 });
    }
  }
  candidates.sort((a, b) => b.range - a.range);
  const top1 = candidates[0] ?? null;

  if (!top1) {
    onLiveInfo('No candidates yet. Press and release the trigger...');
    refs.triggerStableCountRef.current = 0;
    refs.triggerLastTopRef.current = '';
    return;
  }

  const verdict = classifyTriggerByte(refs.triggerBufferRef.current, refs.baselineRef.current, top1.idx);
  onLiveInfo(verdict.kind === 'digital'
    ? `byte[${top1.idx}] bit 0x${verdict.bitMask.toString(16)} is a switch with ${verdict.uniqueCount} value(s)`
    : `byte[${top1.idx}] range=${top1.range} (${top1.min}..${top1.max}) with ${verdict.uniqueCount} value(s)`);

  // The kind is part of the stability key: a byte that changes its mind about
  // what it is has not settled, whatever its range is doing.
  const key = `${top1.idx}:${verdict.kind}`;
  if (key === refs.triggerLastTopRef.current) {
    refs.triggerStableCountRef.current++;
  } else {
    refs.triggerStableCountRef.current = 0;
    refs.triggerLastTopRef.current = key;
  }
  if (refs.triggerStableCountRef.current < TRIGGER_STABLE_FRAMES) return;

  if (verdict.kind === 'digital') {
    onStopRecording();
    onFinalizeDigital({ byteIndex: top1.idx, bitMask: verdict.bitMask });
    return;
  }
  if (verdict.kind === 'analog' && top1.range >= TRIGGER_RANGE_THRESHOLD) {
    onStopRecording();
    onFinalize(top1);
  }
};

export { processGyroFrame, processStickFrame, processTriggerFrame };
