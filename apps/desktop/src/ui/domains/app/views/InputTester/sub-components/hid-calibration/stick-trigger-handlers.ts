/* @layer renderer-components @kind logic */
/**
 * Stick and trigger calibration handler logic.
 * Pure functions that implement the finalization and control flow for analog axes.
 */
import type { HidAxisMapping, InputItem, InputStatus, StickCandidate, StickSide, TriggerSide } from './types';
import { findCounterBytes } from './hid-analysis';

// ── Stick Finalization ──────────────────────────────────────────────────────

interface StickFinalizeRefs {
  stickMinsRef: React.MutableRefObject<Uint8Array>;
  stickMaxsRef: React.MutableRefObject<Uint8Array>;
  stickCounterBytesRef: React.MutableRefObject<Set<number>>;
  excludedRef: React.MutableRefObject<Set<number>>;
  capturedStickBytesRef: React.MutableRefObject<Set<number>>;
  leftStickBytesRef: React.MutableRefObject<Set<number>>;
  rightStickBytesRef: React.MutableRefObject<Set<number>>;
  activeStickRef: React.MutableRefObject<StickSide | null>;
}

interface StickFinalizeCallbacks {
  addLog: (msg: string) => void;
  updateByteStatuses: (len: number) => void;
  setItems: (updater: (prev: InputItem[]) => InputItem[]) => void;
  setActiveStick: (s: StickSide | null) => void;
  setStickBusy: (v: boolean) => void;
  setStickLiveInfo: (s: string) => void;
  setGyroExcluded: (s: Set<number>) => void;
}

const finalizeStickCalibration = (c1: StickCandidate, c2: StickCandidate | null, refs: StickFinalizeRefs, gyroExcluded: Set<number>, cb: StickFinalizeCallbacks): void => {
  const side = refs.activeStickRef.current ?? 'left';
  const label = side === 'left' ? 'LEFT' : 'RIGHT';
  const xId = side === 'left' ? 'leftX' : 'rightX';
  const yId = side === 'left' ? 'leftY' : 'rightY';

  const x = c2 ? (c1.idx < c2.idx ? c1 : c2) : c1;
  const y = c2 ? (c1.idx < c2.idx ? c2 : c1) : null;

  const xMapping: HidAxisMapping = { byteIndex: x.idx, center: x.center, min: x.min, max: x.max, inverted: false };
  const xResult = `byte[${x.idx}] ${x.min}..${x.center}..${x.max} (range ${x.range})`;
  cb.addLog(`✓ ${label} X: ${xResult}`);

  let yMapping: HidAxisMapping | null = null;
  let yResult = 'skipped (single byte)';
  if (y) {
    yMapping = { byteIndex: y.idx, center: y.center, min: y.min, max: y.max, inverted: false };
    yResult = `byte[${y.idx}] ${y.min}..${y.center}..${y.max} (range ${y.range})`;
    cb.addLog(`✓ ${label} Y: ${yResult}`);
  } else {
    cb.addLog(`  ${label} Y: skipped (single byte stick)`);
  }

  const mins = refs.stickMinsRef.current;
  const maxs = refs.stickMaxsRef.current;
  const ctrBytes = refs.stickCounterBytesRef.current;
  const sideBytes = side === 'left' ? refs.leftStickBytesRef : refs.rightStickBytesRef;
  const otherSideBytes = side === 'left' ? refs.rightStickBytesRef : refs.leftStickBytesRef;
  sideBytes.current = new Set();
  const stickExcluded: number[] = [];

  const explicitBytes = new Set<number>();
  explicitBytes.add(x.idx);
  if (y) explicitBytes.add(y.idx);
  for (const bi of explicitBytes) {
    refs.excludedRef.current.add(bi);
    refs.capturedStickBytesRef.current.add(bi);
    sideBytes.current.add(bi);
    stickExcluded.push(bi);
  }

  for (let i = 0; i < mins.length; i++) {
    if (explicitBytes.has(i)) continue;
    if (ctrBytes.has(i)) continue;
    if (gyroExcluded.has(i)) continue;
    if (otherSideBytes.current.has(i)) continue;
    const range = maxs[i] - mins[i];
    if (range >= 3) {
      refs.excludedRef.current.add(i);
      refs.capturedStickBytesRef.current.add(i);
      sideBytes.current.add(i);
      stickExcluded.push(i);
    }
  }
  cb.setGyroExcluded(new Set(refs.excludedRef.current));
  cb.addLog(`  Excluded ${stickExcluded.length} bytes for ${label} stick: [${stickExcluded.join(', ')}]`);

  cb.setItems(prev => prev.map(it => {
    if (it.id === xId) return { ...it, status: 'captured' as InputStatus, result: xResult, axisMapping: xMapping };
    if (it.id === yId) return { ...it, status: (yMapping ? 'captured' : 'skipped') as InputStatus, result: yResult, axisMapping: yMapping ?? undefined };
    return it;
  }));

  cb.setActiveStick(null);
  refs.activeStickRef.current = null;
  cb.setStickBusy(false);
  cb.setStickLiveInfo('');
  cb.addLog(`${label} stick calibration done.`);
  cb.updateByteStatuses(mins.length);
};

// ── Stick Reset ─────────────────────────────────────────────────────────────

const resetStick = (side: StickSide, refs: Pick<StickFinalizeRefs, 'excludedRef' | 'capturedStickBytesRef' | 'leftStickBytesRef' | 'rightStickBytesRef' | 'activeStickRef'>, latestBytesLen: number, cb: Pick<StickFinalizeCallbacks, 'addLog' | 'updateByteStatuses' | 'setItems' | 'setActiveStick' | 'setStickBusy' | 'setGyroExcluded'> & {
    setStickPickMode: (v: boolean) => void;
    setStickPickedBytes: (v: number[]) => void;
    setStickLiveInfo: (s: string) => void;
    stickRecordingRef: React.MutableRefObject<boolean>;
  }): void => {
  const label = side === 'left' ? 'LEFT' : 'RIGHT';
  const xId = side === 'left' ? 'leftX' : 'rightX';
  const yId = side === 'left' ? 'leftY' : 'rightY';
  const sideBytes = side === 'left' ? refs.leftStickBytesRef : refs.rightStickBytesRef;
  for (const b of sideBytes.current) {
    refs.excludedRef.current.delete(b);
    refs.capturedStickBytesRef.current.delete(b);
  }
  sideBytes.current = new Set();
  cb.setGyroExcluded(new Set(refs.excludedRef.current));
  cb.setItems(prev => prev.map(it =>
    (it.id === xId || it.id === yId) ? { ...it, status: 'pending' as InputStatus, result: undefined, axisMapping: undefined } : it
  ));
  cb.stickRecordingRef.current = false;
  cb.setStickBusy(false);
  cb.setStickPickMode(false);
  cb.setStickPickedBytes([]);
  cb.setStickLiveInfo('');
  cb.setActiveStick(null);
  refs.activeStickRef.current = null;
  if (latestBytesLen > 0) cb.updateByteStatuses(latestBytesLen);
  cb.addLog(`${label} stick reset — ready to redo.`);
};

// ── Trigger Finalization ────────────────────────────────────────────────────

interface TriggerFinalizeRefs {
  excludedRef: React.MutableRefObject<Set<number>>;
  capturedTriggerBytesRef: React.MutableRefObject<Set<number>>;
  leftTriggerByteRef: React.MutableRefObject<number | null>;
  rightTriggerByteRef: React.MutableRefObject<number | null>;
  activeTriggerRef: React.MutableRefObject<TriggerSide | null>;
  baselineRef: React.MutableRefObject<Uint8Array>;
}

interface TriggerFinalizeCallbacks {
  addLog: (msg: string) => void;
  updateByteStatuses: (len: number) => void;
  setItems: (updater: (prev: InputItem[]) => InputItem[]) => void;
  setActiveTrigger: (s: TriggerSide | null) => void;
  setTriggerBusy: (v: boolean) => void;
  setTriggerLiveInfo: (s: string) => void;
  setGyroExcluded: (s: Set<number>) => void;
}

const finalizeTriggerCalibration = (c: StickCandidate, refs: TriggerFinalizeRefs, cb: TriggerFinalizeCallbacks): void => {
  const side = refs.activeTriggerRef.current ?? 'left';
  const label = side === 'left' ? 'LEFT' : 'RIGHT';
  const axisId = side === 'left' ? 'leftTrigger' : 'rightTrigger';

  const mapping: HidAxisMapping = { byteIndex: c.idx, center: c.center, min: c.min, max: c.max, inverted: false };
  const result = `byte[${c.idx}] ${c.min}..${c.center}..${c.max} (range ${c.range})`;
  cb.addLog(`✓ ${label} Trigger: ${result}`);

  refs.excludedRef.current.add(c.idx);
  refs.capturedTriggerBytesRef.current.add(c.idx);
  if (side === 'left') refs.leftTriggerByteRef.current = c.idx;
  else refs.rightTriggerByteRef.current = c.idx;

  cb.setGyroExcluded(new Set(refs.excludedRef.current));

  cb.setItems(prev => prev.map(it =>
    it.id === axisId ? { ...it, status: 'captured' as InputStatus, result, axisMapping: mapping } : it
  ));

  cb.setActiveTrigger(null);
  refs.activeTriggerRef.current = null;
  cb.setTriggerBusy(false);
  cb.setTriggerLiveInfo('');
  cb.addLog(`${label} trigger calibration done.`);
  cb.updateByteStatuses(refs.baselineRef.current.length);
};

// ── Trigger Reset ───────────────────────────────────────────────────────────

const resetTrigger = (side: TriggerSide, refs: Pick<TriggerFinalizeRefs, 'excludedRef' | 'capturedTriggerBytesRef' | 'leftTriggerByteRef' | 'rightTriggerByteRef' | 'activeTriggerRef'>, latestBytesLen: number, cb: Pick<TriggerFinalizeCallbacks, 'addLog' | 'updateByteStatuses' | 'setItems' | 'setActiveTrigger' | 'setTriggerBusy' | 'setGyroExcluded'> & {
    setTriggerPickMode: (v: boolean) => void;
    setTriggerPickedByte: (v: number | null) => void;
    setTriggerLiveInfo: (s: string) => void;
    triggerRecordingRef: React.MutableRefObject<boolean>;
  }): void => {
  const label = side === 'left' ? 'LEFT' : 'RIGHT';
  const axisId = side === 'left' ? 'leftTrigger' : 'rightTrigger';
  const prevByte = side === 'left' ? refs.leftTriggerByteRef.current : refs.rightTriggerByteRef.current;
  if (prevByte !== null) {
    refs.excludedRef.current.delete(prevByte);
    refs.capturedTriggerBytesRef.current.delete(prevByte);
  }
  if (side === 'left') refs.leftTriggerByteRef.current = null;
  else refs.rightTriggerByteRef.current = null;
  cb.setGyroExcluded(new Set(refs.excludedRef.current));
  cb.setItems(prev => prev.map(it =>
    it.id === axisId ? { ...it, status: 'pending' as InputStatus, result: undefined, axisMapping: undefined } : it
  ));
  cb.triggerRecordingRef.current = false;
  cb.setTriggerBusy(false);
  cb.setTriggerPickMode(false);
  cb.setTriggerPickedByte(null);
  cb.setTriggerLiveInfo('');
  cb.setActiveTrigger(null);
  refs.activeTriggerRef.current = null;
  if (latestBytesLen > 0) cb.updateByteStatuses(latestBytesLen);
  cb.addLog(`${label} trigger reset — ready to redo.`);
};

export { finalizeStickCalibration, resetStick, finalizeTriggerCalibration, resetTrigger };
export type { StickFinalizeRefs, StickFinalizeCallbacks, TriggerFinalizeRefs, TriggerFinalizeCallbacks };
