/* @layer renderer-components @kind hook */
/**
 * Trigger calibration action handlers for the HID Calibration Wizard.
 * Split out of useCalibrationActions.ts for file-size compliance.
 */
import { useCallback } from 'react';
import type { HidButtonMapping, StickCandidate, TriggerSide } from '../hid-calibration.type';
import type { ActionDeps } from './action-deps';
import { finalizeDigitalTrigger, finalizeTriggerCalibration, resetTrigger } from '../stick-trigger-handlers';

const useTriggerActions = (d: ActionDeps) => {
  const finalizeTrigger = useCallback((c: StickCandidate) => {
    finalizeTriggerCalibration(c, { excludedRef: d.excludedRef, capturedTriggerBytesRef: d.capturedTriggerBytesRef, leftTriggerByteRef: d.leftTriggerByteRef, rightTriggerByteRef: d.rightTriggerByteRef, activeTriggerRef: d.activeTriggerRef, baselineRef: d.baselineRef },
      { addLog: d.addLog, updateByteStatuses: d.updateByteStatuses, setItems: d.setItems, setActiveTrigger: d.setActiveTrigger, setTriggerBusy: d.setTriggerBusy, setTriggerLiveInfo: d.setTriggerLiveInfo, setGyroExcluded: d.setGyroExcluded });
  }, [d.addLog, d.updateByteStatuses]);
  d.finalizeTriggerRef.current = finalizeTrigger;

  const finalizeDigital = useCallback((mapping: HidButtonMapping) => {
    finalizeDigitalTrigger(mapping, { excludedRef: d.excludedRef, capturedTriggerBytesRef: d.capturedTriggerBytesRef, leftTriggerByteRef: d.leftTriggerByteRef, rightTriggerByteRef: d.rightTriggerByteRef, activeTriggerRef: d.activeTriggerRef, baselineRef: d.baselineRef },
      { addLog: d.addLog, updateByteStatuses: d.updateByteStatuses, setItems: d.setItems, setActiveTrigger: d.setActiveTrigger, setTriggerBusy: d.setTriggerBusy, setTriggerLiveInfo: d.setTriggerLiveInfo, setGyroExcluded: d.setGyroExcluded });
  }, [d.addLog, d.updateByteStatuses]);
  d.finalizeDigitalTriggerRef.current = finalizeDigital;

  const handleStartTrigger = useCallback((side: TriggerSide) => {
    d.activeTriggerRef.current = side; d.setActiveTrigger(side); const len = d.baselineRef.current.length;
    d.triggerMinsRef.current = new Uint8Array(len).fill(255); d.triggerMaxsRef.current = new Uint8Array(len).fill(0);
    d.triggerSamplesRef.current = 0; d.triggerStableCountRef.current = 0; d.triggerLastTopRef.current = ''; d.triggerBufferRef.current = [];
    d.triggerRecordingRef.current = true; d.setTriggerBusy(true); d.setTriggerLiveInfo('Press the trigger fully and release...');
    d.addLog(`Recording ${side === 'left' ? 'LEFT' : 'RIGHT'} trigger. Press fully and release a few times.`);
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

  return {
    handleStartTrigger, handleStopTrigger, handleSkipTrigger, handleTriggerRedo,
    handleTriggerPickMode, handleTriggerBytePicked, handleConfirmTriggerPick, handleCancelTriggerPick,
  };
};

export { useTriggerActions };
