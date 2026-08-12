/* @layer renderer-components @kind hook */
/**
 * Action handlers for the HID Calibration Wizard.
 * Separated from useHidCalibration for file-size compliance.
 */
import { useCallback } from 'react';
import type { HidButtonMapping } from '../hid-calibration.type';
import type { ActionDeps } from './action-deps';
import { ANALOG_THRESHOLD_DELTA, STICK_IDS, TRIGGER_IDS } from '../hid-calibration.constants';
import { findCounterBytes, hex, popcount } from '../hid-analysis';
import { useCalibrationExport } from './useCalibrationExport';
import { useStickActions } from './useStickActions';
import { useTriggerActions } from './useTriggerActions';

const useCalibrationActions = (d: ActionDeps) => {
  const handleProfileConfirm = useCallback(() => {
    const p = d.detectedProfile; if (!p) return;
    d.setProfile(p);
    const si = p.axes.filter(a => STICK_IDS.has(a.id)).map(a => ({ kind: 'axis' as const, id: a.id, label: a.label, category: a.category, status: 'pending' as const }));
    const ti = p.axes.filter(a => TRIGGER_IDS.has(a.id)).map(a => ({ kind: 'axis' as const, id: a.id, label: a.label, category: a.category, status: 'pending' as const }));
    const bi = p.buttons.map(b => ({ kind: 'button' as const, id: b.id, label: b.label, category: b.category, status: 'pending' as const }));
    const oi = p.axes.filter(a => !STICK_IDS.has(a.id) && !TRIGGER_IDS.has(a.id)).map(a => ({ kind: 'axis' as const, id: a.id, label: a.label, category: a.category, status: 'pending' as const }));
    d.setItems([...si, ...ti, ...bi, ...oi]); d.setPhase('live');
    d.addLog(`Calibrating ${p.name} — ${si.length + ti.length + bi.length + oi.length} inputs`);
  }, [d.detectedProfile, d.addLog]);

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
    // Remembered separately from excludedRef so a later stick capture can
    // reconsider only what gyro itself flagged. See stick-gyro-reclaim.ts.
    d.gyroExcludedBytesRef.current = new Set(excl);
    d.addLog(`✓ Gyro done: ${excl.size} bytes excluded (${counters.size} counters, ${excl.size - counters.size} gyro/accel)`);
    d.updateByteStatuses(len);
  }, [d.addLog, d.updateByteStatuses]);

  const handleGyroRedo = useCallback(() => {
    d.setGyroState('idle'); d.setGyroChangedBytes(new Set()); d.excludedRef.current = new Set(); d.setGyroExcluded(new Set());
    d.gyroExcludedBytesRef.current = new Set();
    d.addLog('Gyro data cleared — ready to re-record.'); if (d.latestBytes.length > 0) d.updateByteStatuses(d.latestBytes.length);
  }, [d.addLog, d.latestBytes.length, d.updateByteStatuses]);

  const handleGyroSkip = useCallback(() => { d.setGyroState('done'); d.gyroExcludedBytesRef.current = new Set(); d.addLog('Gyro profiling skipped.'); }, [d.addLog]);

  const handleIdleCapture = useCallback(() => {
    if (d.latestBytes.length === 0) { d.addLog('⚠ No reports received yet'); return; }
    d.baselineRef.current = new Uint8Array(d.latestBytes); d.setIdleState('done'); d.addLog(`✓ Idle baseline captured: ${d.latestBytes.length} bytes`);
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

  /**
   * Button detection is nothing but a comparison against the resting report:
   * findButtonBits walks min(baseline.length, frame.length), so with no
   * baseline it compares zero bytes and every press is discarded in silence.
   * Sticks and triggers do not need one, which is why capture could look
   * half-working. Captured here on demand so starting a capture can never be
   * the thing that quietly does nothing.
   */
  const ensureBaseline = useCallback((): boolean => {
    if (d.baselineRef.current.length > 0) return true;
    if (d.latestBytes.length === 0) { d.addLog('⚠ No reports received yet — press nothing and try again.'); return false; }
    d.baselineRef.current = new Uint8Array(d.latestBytes);
    d.setIdleState('done');
    d.addLog(`✓ Idle baseline captured automatically: ${d.latestBytes.length} bytes`);
    return true;
  }, [d.latestBytes, d.addLog]);

  const handleStartButtons = useCallback(() => {
    if (!ensureBaseline()) return;
    const curItems = d.itemsRef.current; let firstIdx = -1;
    for (let i = 0; i < curItems.length; i++) { if (curItems[i].status !== 'captured' && curItems[i].status !== 'skipped' && !STICK_IDS.has(curItems[i].id) && !TRIGGER_IDS.has(curItems[i].id)) { firstIdx = i; break; } }
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
    d.setActiveIndex(prevIdx); d.setCaptureState('waiting-press'); d.setAxisSubStep('pos'); d.releaseCountRef.current = 0; d.confirmCountRef.current = 0; d.detectedBtnRef.current = null; d.awaitingButtonRestRef.current = true;
    d.addLog(`← Back to: ${d.itemsRef.current[prevIdx]?.label}`);
  }, [d.addLog]);

  const handleClickItem = useCallback((idx: number) => {
    const item = d.itemsRef.current[idx]; if (!item || STICK_IDS.has(item.id) || TRIGGER_IDS.has(item.id)) return;
    if (!ensureBaseline()) return;
    if (d.advanceTimerRef.current) { clearTimeout(d.advanceTimerRef.current); d.advanceTimerRef.current = null; }
    d.setItems(prev => prev.map((it, i) => { if (i === d.activeIdxRef.current && it.status === 'active') return { ...it, status: 'pending' }; if (i === idx && it.status !== 'captured') return { ...it, status: 'active' }; return it; }));
    d.setActiveIndex(idx); d.setCaptureState('waiting-press'); d.setAxisSubStep('pos'); d.releaseCountRef.current = 0; d.confirmCountRef.current = 0; d.detectedBtnRef.current = null; d.awaitingButtonRestRef.current = true;
    if (!d.inputPhaseActiveRef.current) { d.setAutoAdvanceWrapped(false); d.setInputPhaseActiveWrapped(true); }
    d.addLog(`→ ${item.label}`);
  }, [d.addLog, ensureBaseline]);

  // Two-state toggle, regardless of what the byte was already classified as:
  // the first click excludes it (clearing any stick/trigger/button
  // classification so the exclusion actually shows), the next click returns
  // it to unregistered. Never cycles into a classification by clicking.
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
