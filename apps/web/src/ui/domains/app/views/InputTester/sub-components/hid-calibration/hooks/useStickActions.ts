/* @layer renderer-components @kind hook */
/**
 * Stick calibration action handlers for the HID Calibration Wizard.
 * Split out of useCalibrationActions.ts for file-size compliance.
 */
import { useCallback } from 'react';
import type { StickCandidate, StickSide } from '../hid-calibration.type';
import type { ActionDeps } from './action-deps';
import { finalizeStickCalibration, resetStick } from '../stick-trigger-handlers';
import { createIdleSampler, IDLE_SAMPLE_MS } from '../stick-center';
import type { IdleResult } from '../stick-center';

const useStickActions = (d: ActionDeps) => {
  const finalizeStick = useCallback((c1: StickCandidate, c2: StickCandidate | null) => {
    finalizeStickCalibration(c1, c2, { stickMinsRef: d.stickMinsRef, stickMaxsRef: d.stickMaxsRef, stickCounterBytesRef: d.stickCounterBytesRef, excludedRef: d.excludedRef, capturedStickBytesRef: d.capturedStickBytesRef, leftStickBytesRef: d.leftStickBytesRef, rightStickBytesRef: d.rightStickBytesRef, activeStickRef: d.activeStickRef },
      { addLog: d.addLog, updateByteStatuses: d.updateByteStatuses, setItems: d.setItems, setActiveStick: d.setActiveStick, setStickBusy: d.setStickBusy, setStickLiveInfo: d.setStickLiveInfo, setGyroExcluded: d.setGyroExcluded });
  }, [d.addLog, d.updateByteStatuses]);
  d.finalizeStickRef.current = finalizeStick;

  /**
   * Reads the stick where it sits, on demand. Started by the user because only
   * they know the stick is actually free, and it keeps the extremes instead of
   * waiting for stillness, so a stick that drifts still produces an answer.
   */
  const handleStickIdle = useCallback((side: StickSide) => {
    const xId = side === 'left' ? 'leftX' : 'rightX';
    const yId = side === 'left' ? 'leftY' : 'rightY';
    const items = d.itemsRef.current;
    const x = items.find((it) => it.id === xId)?.axisMapping;
    const y = items.find((it) => it.id === yId)?.axisMapping;
    if (!x) { d.addLog('Map the stick first, then read its idle.'); return; }

    const asCandidate = (m: typeof x) => ({ idx: m.byteIndex, range: m.max - m.min, min: m.min, max: m.max, center: m.center });
    d.activeStickRef.current = side; d.setActiveStick(side); d.setStickBusy(true);
    d.stickIdleRef.current = createIdleSampler(asCandidate(x), y ? asCandidate(y) : null, Date.now());
    d.setStickLiveInfo('Reading idle...');
    d.addLog(`Reading ${side === 'left' ? 'LEFT' : 'RIGHT'} stick idle. Leave the stick alone.`);
  }, [d.addLog]);

  /** Writes a finished idle reading over the stick's stored centre. */
  const applyIdle = useCallback((result: IdleResult) => {
    const side = d.activeStickRef.current ?? 'left';
    const label = side === 'left' ? 'LEFT' : 'RIGHT';
    const xId = side === 'left' ? 'leftX' : 'rightX';
    const yId = side === 'left' ? 'leftY' : 'rightY';
    const byIdx = new Map<string, typeof result.x>([[xId, result.x]]);
    if (result.y) byIdx.set(yId, result.y);

    d.setItems((prev) => prev.map((it) => {
      const measured = byIdx.get(it.id);
      if (!measured || !it.axisMapping) return it;
      const mapping = { ...it.axisMapping, center: measured.center, idle: measured.idle };
      return { ...it, axisMapping: mapping, result: `byte[${mapping.byteIndex}] ${mapping.min}..${mapping.center}..${mapping.max} (idle drift ${measured.idle.drift})` };
    }));

    // Also recorded as an idle byte reading, which is what the report carries
    // as idleData. One action, so there is nothing to run separately and
    // nothing that can disagree with the mapping it just wrote.
    d.recordIdleResult(`${label} Stick`, {
      label: `${label} Stick`,
      durationMs: IDLE_SAMPLE_MS,
      frameCount: result.x.idle.frames,
      bytes: [result.x, ...(result.y ? [result.y] : [])].map((axis) => ({
        byteIndex: axis.idx,
        min: axis.idle.min,
        max: axis.idle.max,
        range: axis.idle.max - axis.idle.min,
        average: axis.center,
        uniqueCount: axis.idle.uniqueCount,
        uniqueValues: `${axis.idle.uniqueCount} values`,
      })),
    });
    d.addLog(`✓ ${label} idle: centre ${result.x.center}${result.y ? `, ${result.y.center}` : ''} (drift ${result.x.idle.drift}${result.y ? `, ${result.y.idle.drift}` : ''})`);
    d.setStickBusy(false); d.setActiveStick(null); d.activeStickRef.current = null; d.setStickLiveInfo('');
    if (d.latestBytes.length > 0) d.updateByteStatuses(d.latestBytes.length);
  }, [d.addLog, d.latestBytes.length, d.updateByteStatuses, d.recordIdleResult]);
  d.applyIdleRef.current = applyIdle;

  const handleStartCircle = useCallback((side: StickSide) => {
    d.activeStickRef.current = side; d.setActiveStick(side); const len = d.baselineRef.current.length;
    d.stickMinsRef.current = new Uint8Array(len).fill(255); d.stickMaxsRef.current = new Uint8Array(len).fill(0);
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
    if (d.stickPickedBytes.length === 0) return;
    const bl = d.baselineRef.current; const mins = d.stickMinsRef.current; const maxs = d.stickMaxsRef.current; const bytes = d.latestBytes;
    const makeCand = (i: number): StickCandidate => ({ idx: i, range: mins.length > i ? maxs[i] - mins[i] : 0, min: mins.length > i ? mins[i] : 0, max: maxs.length > i ? maxs[i] : 255, center: bl.length > i ? bl[i] : (bytes.length > i ? bytes[i] : 128) });
    const c1 = makeCand(d.stickPickedBytes[0]); const c2 = d.stickPickedBytes.length >= 2 ? makeCand(d.stickPickedBytes[1]) : null;
    d.setStickPickMode(false); d.setStickPickedBytes([]); d.finalizeStickRef.current(c1, c2);
  }, [d.stickPickedBytes, d.latestBytes]);

  const handleCancelPick = useCallback(() => { d.setStickPickMode(false); d.setStickPickedBytes([]); d.addLog('Pick mode cancelled.'); }, [d.addLog]);

  return {
    handleStartCircle, handleStopCircle, handleSkipStick, handleStickRedo,
    handleStickPickMode, handleStickBytePicked, handleConfirmPick, handleCancelPick, handleStickIdle,
  };
};

export { useStickActions };
