/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import type { HidButtonMapping } from '../hid-calibration.type';
import type { ActionDeps } from './action-deps.type';
import { ANALOG_THRESHOLD_DELTA, BYTE_MAX, STICK_IDS, TRIGGER_IDS } from '../hid-calibration.constants';
import { findCounterBytes, hex, popcount } from '../hid-analysis';
import { ANALOG_MIN_CHANGED_BITS, ANALOG_THRESHOLD_FRACTION, FULL_BYTE_MASK } from '../hid-analysis/hid-analysis.constants';
import { DEFAULT_REPORT_LENGTH } from './calibration-actions.constants';
import { useCalibrationExport } from './useCalibrationExport';
import { useStickActions } from './useStickActions';
import { useTriggerActions } from './useTriggerActions';
import { isAnalogItem } from './is-analog-item';

const useCalibrationActions = (d: ActionDeps) => {
  const handleProfileConfirm = useCallback(() => {
    const p = d.detectedProfile; if (!p) return;
    d.setProfile(p);
    const si = p.axes.filter(a => STICK_IDS.has(a.id)).map(a => ({ kind: 'axis' as const, id: a.id, label: a.label, category: a.category, status: 'pending' as const }));
    const ti = p.axes.filter(a => TRIGGER_IDS.has(a.id)).map(a => ({ kind: 'axis' as const, id: a.id, label: a.label, category: a.category, status: 'pending' as const }));
    const bi = p.buttons.map(b => ({ kind: 'button' as const, id: b.id, label: b.label, category: b.category, status: 'pending' as const }));
    const oi = p.axes.filter(a => !STICK_IDS.has(a.id) && !TRIGGER_IDS.has(a.id)).map(a => ({ kind: 'axis' as const, id: a.id, label: a.label, category: a.category, status: 'pending' as const }));
    d.setItems([...si, ...ti, ...bi, ...oi]); d.setPhase('live');
    d.addLog(`Calibrating ${p.name} with ${si.length + ti.length + bi.length + oi.length} inputs`);
  }, [d.detectedProfile, d.addLog]);

  const handleGyroStart = useCallback(() => {
    const len = d.latestBytes.length || DEFAULT_REPORT_LENGTH;
    d.gyroMinsRef.current = new Uint8Array(len).fill(BYTE_MAX); d.gyroMaxsRef.current = new Uint8Array(len).fill(0); d.gyroBufferRef.current = [];
    d.gyroRecordingRef.current = true; d.setGyroState('recording'); d.setGyroChangedBytes(new Set());
    d.addLog('Gyro recording started. Tilt, rotate and shake the controller...');
  }, [d.latestBytes.length, d.addLog]);

  const handleGyroStop = useCallback(() => {
    d.gyroRecordingRef.current = false; const len = d.gyroMinsRef.current.length; const excl = new Set<number>();
    for (let i = 0; i < len; i++) { if (d.gyroMaxsRef.current[i] !== d.gyroMinsRef.current[i]) excl.add(i); }
    const counters = findCounterBytes(d.gyroBufferRef.current); for (const c of counters) excl.add(c);
    d.excludedRef.current = excl; d.setGyroExcluded(new Set(excl)); d.setGyroState('done');
    d.gyroExcludedBytesRef.current = new Set(excl);
    d.addLog(`OK Gyro done: ${excl.size} bytes excluded (${counters.size} counters, ${excl.size - counters.size} gyro/accel)`);
    d.updateByteStatuses(len);
  }, [d.addLog, d.updateByteStatuses]);

  const handleGyroRedo = useCallback(() => {
    d.setGyroState('idle'); d.setGyroChangedBytes(new Set()); d.excludedRef.current = new Set(); d.setGyroExcluded(new Set());
    d.gyroExcludedBytesRef.current = new Set();
    d.addLog('Gyro data cleared. Ready to re-record.'); if (d.latestBytes.length > 0) d.updateByteStatuses(d.latestBytes.length);
  }, [d.addLog, d.latestBytes.length, d.updateByteStatuses]);

  const handleGyroSkip = useCallback(() => { d.setGyroState('done'); d.gyroExcludedBytesRef.current = new Set(); d.addLog('Gyro profiling skipped.'); }, [d.addLog]);

  const handleIdleCapture = useCallback(() => {
    if (d.latestBytes.length === 0) { d.addLog('Warning: No reports received yet'); return; }
    d.baselineRef.current = new Uint8Array(d.latestBytes); d.setIdleState('done'); d.addLog(`OK Idle baseline captured: ${d.latestBytes.length} bytes`);
  }, [d.latestBytes, d.addLog]);

  const handleIdleRedo = useCallback(() => { d.baselineRef.current = new Uint8Array(0); d.setIdleState('idle'); d.addLog('Idle baseline cleared.'); }, [d.addLog]);

  const {
    handleStartCircle, handleStopCircle, handleSkipStick, handleStickRedo, handleStickIdle,
    handleStickPickMode, handleStickBytePicked, handleConfirmPick, handleCancelPick,
  } = useStickActions(d);

  const {
    handleStartTrigger, handleStopTrigger, handleSkipTrigger, handleTriggerRedo,
    handleTriggerPickMode, handleTriggerBytePicked, handleConfirmTriggerPick, handleCancelTriggerPick,
  } = useTriggerActions(d);

  const ensureBaseline = useCallback((): boolean => {
    if (d.baselineRef.current.length > 0) return true;
    if (d.latestBytes.length === 0) { d.addLog('Warning: No reports received yet. Press nothing and try again.'); return false; }
    d.baselineRef.current = new Uint8Array(d.latestBytes);
    d.setIdleState('done');
    d.addLog(`OK Idle baseline captured automatically: ${d.latestBytes.length} bytes`);
    return true;
  }, [d.latestBytes, d.addLog]);

  const handleStartButtons = useCallback(() => {
    if (!ensureBaseline()) return;
    const firstIdx = d.itemsRef.current.findIndex((it) => it.status !== 'captured' && it.status !== 'skipped' && !STICK_IDS.has(it.id) && !TRIGGER_IDS.has(it.id));
    if (firstIdx < 0) { d.addLog('All inputs already mapped!'); return; }
    d.setActiveIndex(firstIdx); d.setCaptureState('waiting-press'); d.setAxisSubStep('pos'); d.setAutoAdvanceWrapped(true); d.setInputPhaseActiveWrapped(true);
    d.awaitingButtonRestRef.current = true;
    d.setItems(prev => prev.map((it, i) => i === firstIdx ? { ...it, status: 'active' } : it));
    d.addLog('Auto-advance started. Press each input once when prompted.');
  }, [d.addLog, ensureBaseline]);

  const handleClearItem = useCallback((idx: number) => {
    const item = d.itemsRef.current[idx]; if (!item) return;
    d.setItems(prev => prev.map((it, i) => i === idx ? { ...it, status: 'pending', result: undefined, mapping: undefined, axisMapping: undefined } : it));
    d.addLog(`Cleared: ${item.label}`); if (d.latestBytes.length > 0) d.updateByteStatuses(d.latestBytes.length);
  }, [d.addLog, d.latestBytes.length, d.updateByteStatuses]);

  const handleManualByteAssign = useCallback((byteIdx: number) => {
    const idx = d.activeIdxRef.current; const item = d.itemsRef.current[idx];
    if (!item || item.status === 'captured') return;
    if (item.kind !== 'button') { d.addLog(`Manual byte assign is for buttons only, and ${item.label} is an axis.`); return; }
    const bl = d.baselineRef.current; const currentVal = d.latestBytes[byteIdx] ?? 0; const baseVal = bl[byteIdx] ?? 0;
    const delta = Math.abs(currentVal - baseVal); const xor = currentVal ^ baseVal;
    let mapping: HidButtonMapping; let result: string;
    if (delta >= ANALOG_THRESHOLD_DELTA && popcount(xor) > ANALOG_MIN_CHANGED_BITS) {
      const threshold = baseVal + Math.floor(delta / ANALOG_THRESHOLD_FRACTION); mapping = { byteIndex: byteIdx, bitMask: FULL_BYTE_MASK, threshold, restValue: baseVal }; result = `byte[${byteIdx}] analog (rest=${baseVal}, threshold=${threshold}) (manual)`;
    } else { const bitMask = xor !== 0 ? xor : FULL_BYTE_MASK; mapping = { byteIndex: byteIdx, bitMask }; result = `byte[${byteIdx}] & 0x${hex(bitMask)} (manual)`; }
    d.addLog(`OK ${item.label}: ${result}`);
    d.setItems(prev => prev.map((it, i) => i === idx ? { ...it, status: 'captured', result, mapping } : it));
    if (d.latestBytes.length > 0) d.updateByteStatuses(d.latestBytes.length);
  }, [d.addLog, d.latestBytes, d.updateByteStatuses]);

  const handleSkip = useCallback(() => { d.setItems(prev => prev.map((it, i) => i === d.activeIdxRef.current ? { ...it, status: 'skipped', result: 'skipped' } : it)); d.setAxisSubStep('pos'); d.doAdvance(); }, [d.doAdvance]);

  const handleGoBack = useCallback(() => {
    if (d.activeIdxRef.current <= 0) return;
    if (d.advanceTimerRef.current) { clearTimeout(d.advanceTimerRef.current); d.advanceTimerRef.current = null; }
    let prevIdx = d.activeIdxRef.current - 1;
    while (prevIdx >= 0 && isAnalogItem(d.itemsRef.current[prevIdx])) prevIdx--;
    if (prevIdx < 0) return;
    d.setItems(prev => prev.map((it, i) => { if (i === d.activeIdxRef.current && it.status !== 'captured') return { ...it, status: 'pending' }; if (i === prevIdx) return { ...it, status: 'active', result: undefined, mapping: undefined, axisMapping: undefined }; return it; }));
    d.setActiveIndex(prevIdx); d.setCaptureState('waiting-press'); d.setAxisSubStep('pos'); d.releaseCountRef.current = 0; d.confirmCountRef.current = 0; d.detectedBtnRef.current = null; d.awaitingButtonRestRef.current = true;
    d.addLog(`Back to: ${d.itemsRef.current[prevIdx]?.label}`);
  }, [d.addLog]);

  const handleClickItem = useCallback((idx: number) => {
    const item = d.itemsRef.current[idx]; if (!item || STICK_IDS.has(item.id) || TRIGGER_IDS.has(item.id)) return;
    if (!ensureBaseline()) return;
    if (d.advanceTimerRef.current) { clearTimeout(d.advanceTimerRef.current); d.advanceTimerRef.current = null; }
    d.setItems(prev => prev.map((it, i) => { if (i === d.activeIdxRef.current && it.status === 'active') return { ...it, status: 'pending' }; if (i === idx && it.status !== 'captured') return { ...it, status: 'active' }; return it; }));
    d.setActiveIndex(idx); d.setCaptureState('waiting-press'); d.setAxisSubStep('pos'); d.releaseCountRef.current = 0; d.confirmCountRef.current = 0; d.detectedBtnRef.current = null; d.awaitingButtonRestRef.current = true;
    if (!d.inputPhaseActiveRef.current) { d.setAutoAdvanceWrapped(false); d.setInputPhaseActiveWrapped(true); }
    d.addLog(`Next: ${item.label}`);
  }, [d.addLog, ensureBaseline]);

  const handleByteClick = useCallback((idx: number) => {
    if (d.stickPickMode) { handleStickBytePicked(idx); return; }
    if (d.triggerPickMode) { handleTriggerBytePicked(idx); return; }
    const activeItem = d.itemsRef.current[d.activeIdxRef.current];
    if (activeItem && activeItem.status === 'active' && d.inputPhaseActiveRef.current) { handleManualByteAssign(idx); return; }

    const currentStatus = d.byteStatusesRef.current[idx] ?? 'unknown';
    const excl = new Set(d.excludedRef.current);
    if (currentStatus === 'excluded') {
      excl.delete(idx);
      d.addLog(`byte[${idx}] restored to unregistered`);
    } else {
      d.capturedStickBytesRef.current.delete(idx);
      d.capturedTriggerBytesRef.current.delete(idx);
      d.setItems(prev => prev.map(it => (it.mapping?.byteIndex === idx && it.status === 'captured')
        ? { ...it, status: 'pending', result: undefined, mapping: undefined, axisMapping: undefined }
        : it));
      excl.add(idx);
      d.addLog(`byte[${idx}] excluded`);
    }
    d.excludedRef.current = excl; d.setGyroExcluded(new Set(excl));
    if (d.latestBytes.length > 0) d.updateByteStatuses(d.latestBytes.length);
  }, [d.addLog, d.latestBytes.length, d.updateByteStatuses, d.stickPickMode, handleStickBytePicked, d.triggerPickMode, handleTriggerBytePicked, handleManualByteAssign, d.setItems]);

  const { handleCopyJson, handleFinish, handleSaveDebugFile } = useCalibrationExport(d);

  return {
    handleProfileConfirm, handleGyroStart, handleGyroStop, handleGyroRedo, handleGyroSkip,
    handleIdleCapture, handleIdleRedo,
    handleStartCircle, handleStopCircle, handleSkipStick, handleStickRedo, handleStickIdle, handleStickPickMode, handleStickBytePicked, handleConfirmPick, handleCancelPick,
    handleStartTrigger, handleStopTrigger, handleSkipTrigger, handleTriggerRedo, handleTriggerPickMode, handleTriggerBytePicked, handleConfirmTriggerPick, handleCancelTriggerPick,
    handleStartButtons, handleClearItem, handleManualByteAssign, handleSkip, handleGoBack, handleClickItem,
    handleByteClick, handleCopyJson, handleFinish, handleSaveDebugFile,
  };
};

export { useCalibrationActions };
export type { ActionDeps };
