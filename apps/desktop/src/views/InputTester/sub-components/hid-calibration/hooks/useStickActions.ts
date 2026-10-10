/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import type { StickCandidate, StickSide } from '../hid-calibration.type';
import type { ActionDeps } from './action-deps.type';
import { finalizeStickCalibration, resetStick } from '../stick-trigger-handlers';
import { BYTE_MAX, BYTE_MID } from '../hid-calibration.constants';
import { useStickIdleActions } from './useStickIdleActions';
import { byteCandidate } from './byte-candidate';

const useStickActions = (d: ActionDeps) => {
  const finalizeStick = useCallback((c1: StickCandidate, c2: StickCandidate | null) => {
    finalizeStickCalibration(c1, c2, { stickMinsRef: d.stickMinsRef, stickMaxsRef: d.stickMaxsRef, stickCounterBytesRef: d.stickCounterBytesRef, excludedRef: d.excludedRef, capturedStickBytesRef: d.capturedStickBytesRef, leftStickBytesRef: d.leftStickBytesRef, rightStickBytesRef: d.rightStickBytesRef, activeStickRef: d.activeStickRef },
      { addLog: d.addLog, updateByteStatuses: d.updateByteStatuses, setItems: d.setItems, setActiveStick: d.setActiveStick, setStickBusy: d.setStickBusy, setStickLiveInfo: d.setStickLiveInfo, setGyroExcluded: d.setGyroExcluded });
  }, [d.addLog, d.updateByteStatuses]);
  d.finalizeStickRef.current = finalizeStick;

  const { handleStickIdle } = useStickIdleActions(d);

  const handleStartCircle = useCallback((side: StickSide) => {
    d.activeStickRef.current = side; d.setActiveStick(side); const len = d.baselineRef.current.length;
    d.stickMinsRef.current = new Uint8Array(len).fill(BYTE_MAX); d.stickMaxsRef.current = new Uint8Array(len).fill(0);
    d.stickCounterBytesRef.current = new Set(); d.stickSamplesRef.current = 0; d.stickStableCountRef.current = 0; d.stickLastTop2Ref.current = ''; d.stickBufferRef.current = [];
    d.stickCaptureStartedAtRef.current = Date.now(); d.stickReclaimAttemptedRef.current = false;
    d.stickRecordingRef.current = true; d.setStickBusy(true); d.setStickLiveInfo('Rotate the stick slowly...');
    d.addLog(`Recording ${side === 'left' ? 'LEFT' : 'RIGHT'} stick. Rotate slowly in a full circle.`);
  }, [d.addLog]);

  const handleStopCircle = useCallback(() => { d.stickRecordingRef.current = false; d.stickIdleRef.current = null; d.stickCaptureStartedAtRef.current = 0; d.setStickBusy(false); d.setActiveStick(null); d.activeStickRef.current = null; d.setStickLiveInfo(''); d.addLog('Stopped recording.'); }, [d.addLog]);
  const handleSkipStick = useCallback((side: StickSide) => { const xId = side === 'left' ? 'leftX' : 'rightX'; const yId = side === 'left' ? 'leftY' : 'rightY'; d.addLog(`Skipped ${side === 'left' ? 'LEFT' : 'RIGHT'} stick`); d.setItems(prev => prev.map(it => (it.id === xId || it.id === yId) ? { ...it, status: 'skipped', result: 'skipped' } : it)); }, [d.addLog]);

  const handleStickRedo = useCallback((side: StickSide) => {
    d.stickIdleRef.current = null;
    resetStick(side, { excludedRef: d.excludedRef, capturedStickBytesRef: d.capturedStickBytesRef, leftStickBytesRef: d.leftStickBytesRef, rightStickBytesRef: d.rightStickBytesRef, activeStickRef: d.activeStickRef }, d.latestBytes.length,
      { addLog: d.addLog, updateByteStatuses: d.updateByteStatuses, setItems: d.setItems, setActiveStick: d.setActiveStick, setStickBusy: d.setStickBusy, setGyroExcluded: d.setGyroExcluded, setStickPickMode: d.setStickPickMode, setStickPickedBytes: d.setStickPickedBytes, setStickLiveInfo: d.setStickLiveInfo, stickRecordingRef: d.stickRecordingRef });
  }, [d.addLog, d.latestBytes.length, d.updateByteStatuses]);

  const handleStickPickMode = useCallback((side: StickSide) => {
    d.stickRecordingRef.current = false; d.stickIdleRef.current = null; d.setStickBusy(false); d.activeStickRef.current = side; d.setActiveStick(side); d.setStickPickMode(true); d.setStickPickedBytes([]);
    d.addLog(`Manual pick mode: click 1 or 2 byte boxes for ${side === 'left' ? 'LEFT' : 'RIGHT'} stick, then Confirm.`);
  }, [d.addLog]);

  const handleStickBytePicked = useCallback((idx: number) => {
    d.setStickPickedBytes((prev: number[]) => { if (prev.includes(idx)) { d.addLog(`byte[${idx}] deselected`); return prev.filter((b: number) => b !== idx); } if (prev.length >= 2) return prev; const next = [...prev, idx]; d.addLog(`byte[${idx}] selected as stick ${next.length === 1 ? 'X' : 'Y'}`); return next; });
  }, [d.addLog]);

  const handleConfirmPick = useCallback(() => {
    const [first, second] = d.stickPickedBytes;
    if (first === undefined) return;
    const source = { mins: d.stickMinsRef.current, maxs: d.stickMaxsRef.current, baseline: d.baselineRef.current, bytes: d.latestBytes, fallbackCenter: BYTE_MID };
    const c1 = byteCandidate({ ...source, idx: first });
    const c2 = second === undefined ? null : byteCandidate({ ...source, idx: second });
    d.setStickPickMode(false); d.setStickPickedBytes([]); d.finalizeStickRef.current(c1, c2);
  }, [d.stickPickedBytes, d.latestBytes]);

  const handleCancelPick = useCallback(() => { d.setStickPickMode(false); d.setStickPickedBytes([]); d.addLog('Pick mode cancelled.'); }, [d.addLog]);

  return {
    handleStartCircle, handleStopCircle, handleSkipStick, handleStickRedo,
    handleStickPickMode, handleStickBytePicked, handleConfirmPick, handleCancelPick, handleStickIdle,
  };
};

export { useStickActions };
