/**
 * Action handlers for the HID Calibration Wizard.
 * Separated from useHidCalibration for file-size compliance.
 */
import { useCallback } from 'react';
import { DEVICE_PROFILES, findDeviceProfileByVidPid } from '@shared/input';
import type { DeviceProfile } from '@shared/input';
import type { AxisSubStep, CaptureState, GyroState, HidAxisMapping, HidButtonMapping, HidControllerMap, IdleRecordResult, IdleState, InputItem, Phase, StickCandidate, StickSide, TriggerSide } from '../types';
import { ANALOG_THRESHOLD_DELTA, STICK_IDS, TRIGGER_IDS } from '../constants';
import { findCounterBytes, hex, popcount } from '../hid-analysis';
import { finalizeStickCalibration, resetStick, finalizeTriggerCalibration, resetTrigger } from '../stick-trigger-handlers';

interface ActionDeps {
  // State
  latestBytes: Uint8Array;
  gyroExcluded: Set<number>;
  stickPickMode: boolean;
  stickPickedBytes: number[];
  triggerPickMode: boolean;
  triggerPickedByte: number | null;
  selectedProfileId: string;
  profile: DeviceProfile | null;
  idleResults: Record<string, IdleRecordResult>;
  // Refs
  baselineRef: React.MutableRefObject<Uint8Array>;
  excludedRef: React.MutableRefObject<Set<number>>;
  capturedStickBytesRef: React.MutableRefObject<Set<number>>;
  capturedTriggerBytesRef: React.MutableRefObject<Set<number>>;
  leftStickBytesRef: React.MutableRefObject<Set<number>>;
  rightStickBytesRef: React.MutableRefObject<Set<number>>;
  leftTriggerByteRef: React.MutableRefObject<number | null>;
  rightTriggerByteRef: React.MutableRefObject<number | null>;
  activeStickRef: React.MutableRefObject<StickSide | null>;
  activeTriggerRef: React.MutableRefObject<TriggerSide | null>;
  stickMinsRef: React.MutableRefObject<Uint8Array>;
  stickMaxsRef: React.MutableRefObject<Uint8Array>;
  stickCounterBytesRef: React.MutableRefObject<Set<number>>;
  stickSamplesRef: React.MutableRefObject<number>;
  stickStableCountRef: React.MutableRefObject<number>;
  stickLastTop2Ref: React.MutableRefObject<string>;
  stickBufferRef: React.MutableRefObject<Uint8Array[]>;
  stickRecordingRef: React.MutableRefObject<boolean>;
  triggerMinsRef: React.MutableRefObject<Uint8Array>;
  triggerMaxsRef: React.MutableRefObject<Uint8Array>;
  triggerSamplesRef: React.MutableRefObject<number>;
  triggerStableCountRef: React.MutableRefObject<number>;
  triggerLastTopRef: React.MutableRefObject<string>;
  triggerBufferRef: React.MutableRefObject<Uint8Array[]>;
  triggerRecordingRef: React.MutableRefObject<boolean>;
  gyroMinsRef: React.MutableRefObject<Uint8Array>;
  gyroMaxsRef: React.MutableRefObject<Uint8Array>;
  gyroBufferRef: React.MutableRefObject<Uint8Array[]>;
  gyroRecordingRef: React.MutableRefObject<boolean>;
  finalizeStickRef: React.MutableRefObject<(c1: StickCandidate, c2: StickCandidate | null) => void>;
  finalizeTriggerRef: React.MutableRefObject<(c: StickCandidate) => void>;
  activeIdxRef: React.MutableRefObject<number>;
  advanceTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  itemsRef: React.MutableRefObject<InputItem[]>;
  releaseCountRef: React.MutableRefObject<number>;
  confirmCountRef: React.MutableRefObject<number>;
  detectedBtnRef: React.MutableRefObject<HidButtonMapping | null>;
  inputPhaseActiveRef: React.MutableRefObject<boolean>;
  deviceInfoRef: React.MutableRefObject<{ vendorId: number; productId: number; reportId: number; reportLength: number }>;
  // Callbacks
  addLog: (msg: string) => void;
  updateByteStatuses: (len: number) => void;
  doAdvance: () => void;
  setItems: (u: InputItem[] | ((prev: InputItem[]) => InputItem[])) => void;
  setActiveIndex: (i: number) => void;
  setCaptureState: (s: CaptureState) => void;
  setAxisSubStep: (s: AxisSubStep) => void;
  setAutoAdvanceWrapped: (v: boolean) => void;
  setInputPhaseActiveWrapped: (v: boolean) => void;
  setGyroState: (s: GyroState) => void;
  setGyroChangedBytes: (s: Set<number>) => void;
  setGyroExcluded: (s: Set<number>) => void;
  setIdleState: (s: IdleState) => void;
  setActiveStick: (s: StickSide | null) => void;
  setStickBusy: (v: boolean) => void;
  setStickLiveInfo: (s: string) => void;
  setStickPickMode: (v: boolean) => void;
  setStickPickedBytes: (v: number[] | ((prev: number[]) => number[])) => void;
  setActiveTrigger: (s: TriggerSide | null) => void;
  setTriggerBusy: (v: boolean) => void;
  setTriggerLiveInfo: (s: string) => void;
  setTriggerPickMode: (v: boolean) => void;
  setTriggerPickedByte: (v: number | null | ((prev: number | null) => number | null)) => void;
  setProfile: (p: DeviceProfile | null) => void;
  setPhase: (p: Phase) => void;
  onComplete: (map: HidControllerMap) => void;
}

const useCalibrationActions = (d: ActionDeps) => {
  const handleProfileConfirm = useCallback(() => {
    const p = DEVICE_PROFILES.find(pr => pr.id === d.selectedProfileId); if (!p) return;
    d.setProfile(p);
    const si = p.axes.filter(a => STICK_IDS.has(a.id)).map(a => ({ kind: 'axis' as const, id: a.id, label: a.label, category: a.category, status: 'pending' as const }));
    const ti = p.axes.filter(a => TRIGGER_IDS.has(a.id)).map(a => ({ kind: 'axis' as const, id: a.id, label: a.label, category: a.category, status: 'pending' as const }));
    const bi = p.buttons.map(b => ({ kind: 'button' as const, id: b.id, label: b.label, category: b.category, status: 'pending' as const }));
    const oi = p.axes.filter(a => !STICK_IDS.has(a.id) && !TRIGGER_IDS.has(a.id)).map(a => ({ kind: 'axis' as const, id: a.id, label: a.label, category: a.category, status: 'pending' as const }));
    d.setItems([...si, ...ti, ...bi, ...oi]); d.setPhase('live');
    d.addLog(`Calibrating ${p.name} — ${si.length + ti.length + bi.length + oi.length} inputs`);
  }, [d.selectedProfileId, d.addLog]);

  const handleGyroStart = useCallback(() => {
    const len = d.latestBytes.length || 64;
    d.gyroMinsRef.current = new Uint8Array(len).fill(255); d.gyroMaxsRef.current = new Uint8Array(len).fill(0); d.gyroBufferRef.current = [];
    d.gyroRecordingRef.current = true; d.setGyroState('recording'); d.setGyroChangedBytes(new Set());
    d.addLog('Gyro recording started — tilt, rotate, shake the controller...');
  }, [d.latestBytes.length, d.addLog]);

  const handleGyroStop = useCallback(() => {
    d.gyroRecordingRef.current = false; const len = d.gyroMinsRef.current.length; const excl = new Set<number>();
    for (let i = 0; i < len; i++) { if (d.gyroMaxsRef.current[i] !== d.gyroMinsRef.current[i]) excl.add(i); }
    const counters = findCounterBytes(d.gyroBufferRef.current); for (const c of counters) excl.add(c);
    d.excludedRef.current = excl; d.setGyroExcluded(new Set(excl)); d.setGyroState('done');
    d.addLog(`✓ Gyro done: ${excl.size} bytes excluded (${counters.size} counters, ${excl.size - counters.size} gyro/accel)`);
    d.updateByteStatuses(len);
  }, [d.addLog, d.updateByteStatuses]);

  const handleGyroRedo = useCallback(() => {
    d.setGyroState('idle'); d.setGyroChangedBytes(new Set()); d.excludedRef.current = new Set(); d.setGyroExcluded(new Set());
    d.addLog('Gyro data cleared — ready to re-record.'); if (d.latestBytes.length > 0) d.updateByteStatuses(d.latestBytes.length);
  }, [d.addLog, d.latestBytes.length, d.updateByteStatuses]);

  const handleGyroSkip = useCallback(() => { d.setGyroState('done'); d.addLog('Gyro profiling skipped.'); }, [d.addLog]);

  const handleIdleCapture = useCallback(() => {
    if (d.latestBytes.length === 0) { d.addLog('⚠ No reports received yet'); return; }
    d.baselineRef.current = new Uint8Array(d.latestBytes); d.setIdleState('done'); d.addLog(`✓ Idle baseline captured: ${d.latestBytes.length} bytes`);
  }, [d.latestBytes, d.addLog]);

  const handleIdleRedo = useCallback(() => { d.baselineRef.current = new Uint8Array(0); d.setIdleState('idle'); d.addLog('Idle baseline cleared.'); }, [d.addLog]);

  const finalizeStick = useCallback((c1: StickCandidate, c2: StickCandidate | null) => {
    finalizeStickCalibration(c1, c2, { stickMinsRef: d.stickMinsRef, stickMaxsRef: d.stickMaxsRef, stickCounterBytesRef: d.stickCounterBytesRef, excludedRef: d.excludedRef, capturedStickBytesRef: d.capturedStickBytesRef, leftStickBytesRef: d.leftStickBytesRef, rightStickBytesRef: d.rightStickBytesRef, activeStickRef: d.activeStickRef }, d.gyroExcluded,
      { addLog: d.addLog, updateByteStatuses: d.updateByteStatuses, setItems: d.setItems, setActiveStick: d.setActiveStick, setStickBusy: d.setStickBusy, setStickLiveInfo: d.setStickLiveInfo, setGyroExcluded: d.setGyroExcluded });
  }, [d.addLog, d.updateByteStatuses, d.gyroExcluded]);
  d.finalizeStickRef.current = finalizeStick;

  const handleStartCircle = useCallback((side: StickSide) => {
    d.activeStickRef.current = side; d.setActiveStick(side); const len = d.baselineRef.current.length;
    d.stickMinsRef.current = new Uint8Array(len).fill(255); d.stickMaxsRef.current = new Uint8Array(len).fill(0);
    d.stickCounterBytesRef.current = new Set(); d.stickSamplesRef.current = 0; d.stickStableCountRef.current = 0; d.stickLastTop2Ref.current = ''; d.stickBufferRef.current = [];
    d.stickRecordingRef.current = true; d.setStickBusy(true); d.setStickLiveInfo('Rotate the stick slowly...');
    d.addLog(`Recording ${side === 'left' ? 'LEFT' : 'RIGHT'} stick — rotate slowly in a full circle.`);
  }, [d.addLog]);

  const handleStopCircle = useCallback(() => { d.stickRecordingRef.current = false; d.setStickBusy(false); d.setActiveStick(null); d.activeStickRef.current = null; d.setStickLiveInfo(''); d.addLog('Stopped recording.'); }, [d.addLog]);
  const handleSkipStick = useCallback((side: StickSide) => { const xId = side === 'left' ? 'leftX' : 'rightX'; const yId = side === 'left' ? 'leftY' : 'rightY'; d.addLog(`Skipped ${side === 'left' ? 'LEFT' : 'RIGHT'} stick`); d.setItems(prev => prev.map(it => (it.id === xId || it.id === yId) ? { ...it, status: 'skipped', result: 'skipped' } : it)); }, [d.addLog]);

  const handleStickRedo = useCallback((side: StickSide) => {
    resetStick(side, { excludedRef: d.excludedRef, capturedStickBytesRef: d.capturedStickBytesRef, leftStickBytesRef: d.leftStickBytesRef, rightStickBytesRef: d.rightStickBytesRef, activeStickRef: d.activeStickRef }, d.latestBytes.length,
      { addLog: d.addLog, updateByteStatuses: d.updateByteStatuses, setItems: d.setItems, setActiveStick: d.setActiveStick, setStickBusy: d.setStickBusy, setGyroExcluded: d.setGyroExcluded, setStickPickMode: d.setStickPickMode, setStickPickedBytes: d.setStickPickedBytes, setStickLiveInfo: d.setStickLiveInfo, stickRecordingRef: d.stickRecordingRef });
  }, [d.addLog, d.latestBytes.length, d.updateByteStatuses]);

  const handleStickPickMode = useCallback((side: StickSide) => {
    d.stickRecordingRef.current = false; d.setStickBusy(false); d.activeStickRef.current = side; d.setActiveStick(side); d.setStickPickMode(true); d.setStickPickedBytes([]);
    d.addLog(`Manual pick mode: click 1 or 2 byte boxes for ${side === 'left' ? 'LEFT' : 'RIGHT'} stick, then Confirm.`);
  }, [d.addLog]);

  const handleStickBytePicked = useCallback((idx: number) => {
    d.setStickPickedBytes((prev: number[]) => { if (prev.includes(idx)) { d.addLog(`byte[${idx}] deselected`); return prev.filter((b: number) => b !== idx); } if (prev.length >= 2) return prev; const next = [...prev, idx]; d.addLog(`byte[${idx}] selected as stick ${next.length === 1 ? 'X' : 'Y'}`); return next; });
  }, [d.addLog]);

  const handleConfirmPick = useCallback(() => {
    if (d.stickPickedBytes.length === 0) return;
    const bl = d.baselineRef.current; const mins = d.stickMinsRef.current; const maxs = d.stickMaxsRef.current; const bytes = d.latestBytes;
    const makeCand = (i: number): StickCandidate => ({ idx: i, range: mins.length > i ? maxs[i] - mins[i] : 0, min: mins.length > i ? mins[i] : 0, max: maxs.length > i ? maxs[i] : 255, center: bl.length > i ? bl[i] : (bytes.length > i ? bytes[i] : 128) });
    const c1 = makeCand(d.stickPickedBytes[0]); const c2 = d.stickPickedBytes.length >= 2 ? makeCand(d.stickPickedBytes[1]) : null;
    d.setStickPickMode(false); d.setStickPickedBytes([]); d.finalizeStickRef.current(c1, c2);
  }, [d.stickPickedBytes, d.latestBytes]);

  const handleCancelPick = useCallback(() => { d.setStickPickMode(false); d.setStickPickedBytes([]); d.addLog('Pick mode cancelled.'); }, [d.addLog]);

  const finalizeTrigger = useCallback((c: StickCandidate) => {
    finalizeTriggerCalibration(c, { excludedRef: d.excludedRef, capturedTriggerBytesRef: d.capturedTriggerBytesRef, leftTriggerByteRef: d.leftTriggerByteRef, rightTriggerByteRef: d.rightTriggerByteRef, activeTriggerRef: d.activeTriggerRef, baselineRef: d.baselineRef },
      { addLog: d.addLog, updateByteStatuses: d.updateByteStatuses, setItems: d.setItems, setActiveTrigger: d.setActiveTrigger, setTriggerBusy: d.setTriggerBusy, setTriggerLiveInfo: d.setTriggerLiveInfo, setGyroExcluded: d.setGyroExcluded });
  }, [d.addLog, d.updateByteStatuses]);
  d.finalizeTriggerRef.current = finalizeTrigger;

  const handleStartTrigger = useCallback((side: TriggerSide) => {
    d.activeTriggerRef.current = side; d.setActiveTrigger(side); const len = d.baselineRef.current.length;
    d.triggerMinsRef.current = new Uint8Array(len).fill(255); d.triggerMaxsRef.current = new Uint8Array(len).fill(0);
    d.triggerSamplesRef.current = 0; d.triggerStableCountRef.current = 0; d.triggerLastTopRef.current = ''; d.triggerBufferRef.current = [];
    d.triggerRecordingRef.current = true; d.setTriggerBusy(true); d.setTriggerLiveInfo('Press the trigger fully and release...');
    d.addLog(`Recording ${side === 'left' ? 'LEFT' : 'RIGHT'} trigger — press fully and release a few times.`);
  }, [d.addLog]);

  const handleStopTrigger = useCallback(() => { d.triggerRecordingRef.current = false; d.setTriggerBusy(false); d.setActiveTrigger(null); d.activeTriggerRef.current = null; d.setTriggerLiveInfo(''); d.addLog('Stopped trigger recording.'); }, [d.addLog]);
  const handleSkipTrigger = useCallback((side: TriggerSide) => { const axisId = side === 'left' ? 'leftTrigger' : 'rightTrigger'; d.addLog(`Skipped ${side === 'left' ? 'LEFT' : 'RIGHT'} trigger`); d.setItems(prev => prev.map(it => it.id === axisId ? { ...it, status: 'skipped', result: 'skipped' } : it)); }, [d.addLog]);

  const handleTriggerRedo = useCallback((side: TriggerSide) => {
    resetTrigger(side, { excludedRef: d.excludedRef, capturedTriggerBytesRef: d.capturedTriggerBytesRef, leftTriggerByteRef: d.leftTriggerByteRef, rightTriggerByteRef: d.rightTriggerByteRef, activeTriggerRef: d.activeTriggerRef }, d.latestBytes.length,
      { addLog: d.addLog, updateByteStatuses: d.updateByteStatuses, setItems: d.setItems, setActiveTrigger: d.setActiveTrigger, setTriggerBusy: d.setTriggerBusy, setGyroExcluded: d.setGyroExcluded, setTriggerPickMode: d.setTriggerPickMode, setTriggerPickedByte: d.setTriggerPickedByte, setTriggerLiveInfo: d.setTriggerLiveInfo, triggerRecordingRef: d.triggerRecordingRef });
  }, [d.addLog, d.latestBytes.length, d.updateByteStatuses]);

  const handleTriggerPickMode = useCallback((side: TriggerSide) => {
    d.triggerRecordingRef.current = false; d.setTriggerBusy(false); d.activeTriggerRef.current = side; d.setActiveTrigger(side); d.setTriggerPickMode(true); d.setTriggerPickedByte(null);
    d.addLog(`Manual pick mode: click 1 byte box for ${side === 'left' ? 'LEFT' : 'RIGHT'} trigger, then Confirm.`);
  }, [d.addLog]);

  const handleTriggerBytePicked = useCallback((idx: number) => { d.setTriggerPickedByte((prev: number | null) => { if (prev === idx) { d.addLog(`byte[${idx}] deselected`); return null; } d.addLog(`byte[${idx}] selected as trigger`); return idx; }); }, [d.addLog]);

  const handleConfirmTriggerPick = useCallback(() => {
    if (d.triggerPickedByte === null) return;
    const bl = d.baselineRef.current; const mins = d.triggerMinsRef.current; const maxs = d.triggerMaxsRef.current; const bytes = d.latestBytes; const i = d.triggerPickedByte;
    const c: StickCandidate = { idx: i, range: mins.length > i ? maxs[i] - mins[i] : 0, min: mins.length > i ? mins[i] : 0, max: maxs.length > i ? maxs[i] : 255, center: bl.length > i ? bl[i] : (bytes.length > i ? bytes[i] : 0) };
    d.setTriggerPickMode(false); d.setTriggerPickedByte(null); d.finalizeTriggerRef.current(c);
  }, [d.triggerPickedByte, d.latestBytes]);

  const handleCancelTriggerPick = useCallback(() => { d.setTriggerPickMode(false); d.setTriggerPickedByte(null); d.setActiveTrigger(null); d.activeTriggerRef.current = null; d.addLog('Trigger pick mode cancelled.'); }, [d.addLog]);

  const handleStartButtons = useCallback(() => {
    const curItems = d.itemsRef.current; let firstIdx = -1;
    for (let i = 0; i < curItems.length; i++) { if (curItems[i].status !== 'captured' && curItems[i].status !== 'skipped' && !STICK_IDS.has(curItems[i].id) && !TRIGGER_IDS.has(curItems[i].id)) { firstIdx = i; break; } }
    if (firstIdx < 0) { d.addLog('All inputs already mapped!'); return; }
    d.setActiveIndex(firstIdx); d.setCaptureState('waiting-press'); d.setAxisSubStep('pos'); d.setAutoAdvanceWrapped(true); d.setInputPhaseActiveWrapped(true);
    d.setItems(prev => prev.map((it, i) => i === firstIdx ? { ...it, status: 'active' } : it));
    d.addLog('Auto-advance started — press each button when prompted.');
  }, [d.addLog]);

  const handleClearItem = useCallback((idx: number) => {
    const item = d.itemsRef.current[idx]; if (!item) return;
    d.setItems(prev => prev.map((it, i) => i === idx ? { ...it, status: 'pending', result: undefined, mapping: undefined, axisMapping: undefined } : it));
    d.addLog(`Cleared: ${item.label}`); if (d.latestBytes.length > 0) d.updateByteStatuses(d.latestBytes.length);
  }, [d.addLog, d.latestBytes.length, d.updateByteStatuses]);

  const handleManualByteAssign = useCallback((byteIdx: number) => {
    const idx = d.activeIdxRef.current; const item = d.itemsRef.current[idx];
    if (!item || item.status === 'captured') return;
    if (item.kind !== 'button') { d.addLog(`Manual byte assign is for buttons only — ${item.label} is an axis.`); return; }
    const bl = d.baselineRef.current; const currentVal = d.latestBytes[byteIdx] ?? 0; const baseVal = bl[byteIdx] ?? 0;
    const delta = Math.abs(currentVal - baseVal); const xor = currentVal ^ baseVal;
    let mapping: HidButtonMapping; let result: string;
    if (delta >= ANALOG_THRESHOLD_DELTA && popcount(xor) > 3) {
      const threshold = baseVal + Math.floor(delta / 3); mapping = { byteIndex: byteIdx, bitMask: 0xFF, threshold, restValue: baseVal }; result = `byte[${byteIdx}] analog (rest=${baseVal}, threshold=${threshold}) (manual)`;
    } else { const bitMask = xor !== 0 ? xor : 0xFF; mapping = { byteIndex: byteIdx, bitMask }; result = `byte[${byteIdx}] & 0x${hex(bitMask)} (manual)`; }
    d.addLog(`✓ ${item.label}: ${result}`);
    d.setItems(prev => prev.map((it, i) => i === idx ? { ...it, status: 'captured', result, mapping } : it));
    if (d.latestBytes.length > 0) d.updateByteStatuses(d.latestBytes.length);
  }, [d.addLog, d.latestBytes, d.updateByteStatuses]);

  const handleSkip = useCallback(() => { d.setItems(prev => prev.map((it, i) => i === d.activeIdxRef.current ? { ...it, status: 'skipped', result: 'skipped' } : it)); d.setAxisSubStep('pos'); d.doAdvance(); }, [d.doAdvance]);

  const handleGoBack = useCallback(() => {
    if (d.activeIdxRef.current <= 0) return;
    if (d.advanceTimerRef.current) { clearTimeout(d.advanceTimerRef.current); d.advanceTimerRef.current = null; }
    let prevIdx = d.activeIdxRef.current - 1;
    while (prevIdx >= 0 && (STICK_IDS.has(d.itemsRef.current[prevIdx]?.id) || TRIGGER_IDS.has(d.itemsRef.current[prevIdx]?.id))) prevIdx--;
    if (prevIdx < 0) return;
    d.setItems(prev => prev.map((it, i) => { if (i === d.activeIdxRef.current && it.status !== 'captured') return { ...it, status: 'pending' }; if (i === prevIdx) return { ...it, status: 'active', result: undefined, mapping: undefined, axisMapping: undefined }; return it; }));
    d.setActiveIndex(prevIdx); d.setCaptureState('waiting-press'); d.setAxisSubStep('pos'); d.releaseCountRef.current = 0; d.confirmCountRef.current = 0; d.detectedBtnRef.current = null;
    d.addLog(`← Back to: ${d.itemsRef.current[prevIdx]?.label}`);
  }, [d.addLog]);

  const handleClickItem = useCallback((idx: number) => {
    const item = d.itemsRef.current[idx]; if (!item || STICK_IDS.has(item.id) || TRIGGER_IDS.has(item.id)) return;
    if (d.advanceTimerRef.current) { clearTimeout(d.advanceTimerRef.current); d.advanceTimerRef.current = null; }
    d.setItems(prev => prev.map((it, i) => { if (i === d.activeIdxRef.current && it.status === 'active') return { ...it, status: 'pending' }; if (i === idx && it.status !== 'captured') return { ...it, status: 'active' }; return it; }));
    d.setActiveIndex(idx); d.setCaptureState('waiting-press'); d.setAxisSubStep('pos'); d.releaseCountRef.current = 0; d.confirmCountRef.current = 0; d.detectedBtnRef.current = null;
    if (!d.inputPhaseActiveRef.current) { d.setAutoAdvanceWrapped(false); d.setInputPhaseActiveWrapped(true); }
    d.addLog(`→ ${item.label}`);
  }, [d.addLog]);

  const handleByteClick = useCallback((idx: number) => {
    if (d.stickPickMode) { handleStickBytePicked(idx); return; }
    if (d.triggerPickMode) { handleTriggerBytePicked(idx); return; }
    const activeItem = d.itemsRef.current[d.activeIdxRef.current];
    if (activeItem && activeItem.status === 'active' && d.inputPhaseActiveRef.current) { handleManualByteAssign(idx); return; }
    const excl = new Set(d.excludedRef.current);
    if (excl.has(idx)) { excl.delete(idx); d.addLog(`byte[${idx}] manually included`); } else { excl.add(idx); d.addLog(`byte[${idx}] manually excluded`); }
    d.excludedRef.current = excl; d.setGyroExcluded(new Set(excl));
    if (d.latestBytes.length > 0) d.updateByteStatuses(d.latestBytes.length);
  }, [d.addLog, d.latestBytes.length, d.updateByteStatuses, d.stickPickMode, handleStickBytePicked, d.triggerPickMode, handleTriggerBytePicked, handleManualByteAssign]);

  const buildCalibrationMap = useCallback((): HidControllerMap => {
    const buttons: Record<string, HidButtonMapping> = {}; const axes: Record<string, HidAxisMapping> = {};
    for (const item of d.itemsRef.current) { if (item.kind === 'button' && item.mapping) buttons[item.id] = item.mapping; if (item.kind === 'axis' && item.axisMapping) axes[item.id] = item.axisMapping; }
    return { name: d.profile?.name ?? 'Unknown', profileId: d.profile?.id ?? 'generic', vendorId: d.deviceInfoRef.current.vendorId, productId: d.deviceInfoRef.current.productId, reportId: d.deviceInfoRef.current.reportId, reportLength: d.deviceInfoRef.current.reportLength, buttons, axes, excludedBytes: [...d.excludedRef.current].sort((a, b) => a - b), ...(Object.keys(d.idleResults).length > 0 && { idleData: d.idleResults }), createdAt: Date.now() };
  }, [d.profile, d.idleResults]);

  const handleCopyJson = useCallback(() => { navigator.clipboard.writeText(JSON.stringify(buildCalibrationMap(), null, 2)); d.addLog('Copied calibration JSON to clipboard.'); }, [buildCalibrationMap, d.addLog]);
  const handleFinish = useCallback(() => { d.onComplete(buildCalibrationMap()); }, [buildCalibrationMap, d.onComplete]);

  return {
    handleProfileConfirm, handleGyroStart, handleGyroStop, handleGyroRedo, handleGyroSkip,
    handleIdleCapture, handleIdleRedo,
    handleStartCircle, handleStopCircle, handleSkipStick, handleStickRedo, handleStickPickMode, handleStickBytePicked, handleConfirmPick, handleCancelPick,
    handleStartTrigger, handleStopTrigger, handleSkipTrigger, handleTriggerRedo, handleTriggerPickMode, handleTriggerBytePicked, handleConfirmTriggerPick, handleCancelTriggerPick,
    handleStartButtons, handleClearItem, handleManualByteAssign, handleSkip, handleGoBack, handleClickItem,
    handleByteClick, handleCopyJson, handleFinish,
  };
};

export { useCalibrationActions };
export type { ActionDeps };
