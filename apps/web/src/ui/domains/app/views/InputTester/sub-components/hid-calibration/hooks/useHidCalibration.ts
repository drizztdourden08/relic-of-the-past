/* @layer renderer-components @kind hook */
/**
 * Core state machine hook for the HID Calibration Wizard.
 * Declares state/refs and delegates action handlers to useCalibrationActions.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePlatform } from '@app/platform';
import { useAppVersion } from '@app/hooks/useAppVersion';
import { webHidReader } from '../../../../../../../../lib/input/hid-reader';
import type { WebHidInputState, WebHidRawReport } from '../../../../../../../../lib/input/hid-reader';
import type { DeviceProfile } from '@shared/input';
import type {
  AxisSubStep, ByteStatus, CaptureState, GyroState, HidButtonMapping, HidControllerMap,
  IdleRecordResult, IdleState, InputItem, Phase,
  StickCandidate, StickSide, TriggerSide,
} from '../hid-calibration.type';
import { STICK_IDS, TRIGGER_IDS } from '../hid-calibration.constants';
import { processGyroFrame, processStickFrame, processTriggerFrame } from '../report-processing';
import { processButtonFrame } from '../button-detection';
import { computeByteStatuses, getInstructionText, getByteColor } from '../wizard-helpers';
import type { ByteColorResult } from '../wizard-helpers';
import { useCalibrationActions } from './useCalibrationActions';
import { useDeviceAutoDetect } from './useDeviceAutoDetect';
import { useDeviceRawInfo } from './useDeviceRawInfo';

interface UseHidCalibrationProps {
  onComplete: (map: HidControllerMap) => void;
  onCancel: () => void;
  deviceKey?: string;
}

const useHidCalibration = (props: UseHidCalibrationProps) => {
  const { onComplete, deviceKey } = props;

  // ── State ──
  const [profile, setProfile] = useState<DeviceProfile | null>(null);
  const [phase, setPhase] = useState<Phase>('select-profile');
  const [gyroState, setGyroState] = useState<GyroState>('idle');
  const [idleState, setIdleState] = useState<IdleState>('idle');
  const [gyroExcluded, setGyroExcluded] = useState<Set<number>>(new Set());
  const [activeStick, setActiveStick] = useState<StickSide | null>(null);
  const [stickBusy, setStickBusy] = useState(false);
  const [stickLiveInfo, setStickLiveInfo] = useState('');
  const [stickPickMode, setStickPickMode] = useState(false);
  const [stickPickedBytes, setStickPickedBytes] = useState<number[]>([]);
  const [activeTrigger, setActiveTrigger] = useState<TriggerSide | null>(null);
  const [triggerBusy, setTriggerBusy] = useState(false);
  const [triggerLiveInfo, setTriggerLiveInfo] = useState('');
  const [triggerPickMode, setTriggerPickMode] = useState(false);
  const [triggerPickedByte, setTriggerPickedByte] = useState<number | null>(null);
  const [items, _setItems] = useState<InputItem[]>([]);
  const [activeIndex, _setActiveIndex] = useState(-1);
  const [captureState, _setCaptureState] = useState<CaptureState>('waiting-press');
  const [axisSubStep, _setAxisSubStep] = useState<AxisSubStep>('pos');
  const [inputPhaseActive, setInputPhaseActive] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [latestBytes, setLatestBytes] = useState<Uint8Array>(new Uint8Array(0));
  const [byteStatuses, setByteStatuses] = useState<ByteStatus[]>([]);
  const [gyroChangedBytes, setGyroChangedBytes] = useState<Set<number>>(new Set());
  const [log, setLog] = useState<string[]>([]);
  const [idleRecording, setIdleRecording] = useState<string | null>(null);
  const [idleResults, setIdleResults] = useState<Record<string, IdleRecordResult>>({});
  // What the REAL, currently-shipped parser (BaseController.parseReport, via
  // findController) reports for these same live bytes — not a re-guess.
  const [liveParsedState, setLiveParsedState] = useState<WebHidInputState | null>(null);

  // ── Refs ──
  const logRef = useRef<HTMLDivElement>(null);
  const activeIdxRef = useRef(-1);
  const captureStateRef = useRef<CaptureState>('waiting-press');
  const axisSubStepRef = useRef<AxisSubStep>('pos');
  const itemsRef = useRef<InputItem[]>([]);
  const releaseCountRef = useRef(0);
  const detectedBtnRef = useRef<HidButtonMapping | null>(null);
  const confirmCountRef = useRef(0);
  const axisCapRef = useRef<Record<string, { posBytes: Uint8Array | null; negBytes: Uint8Array | null }>>({});
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAdvanceRef = useRef(false);
  const lastReportIdRef = useRef(0);
  const inputPhaseActiveRef = useRef(false);
  const baselineRef = useRef(new Uint8Array(0));
  const excludedRef = useRef(new Set<number>());
  const deviceInfoRef = useRef({ vendorId: 0, productId: 0, reportId: 0, reportLength: 0 });
  const gyroRecordingRef = useRef(false);
  const gyroMinsRef = useRef<Uint8Array>(new Uint8Array(0));
  const gyroMaxsRef = useRef<Uint8Array>(new Uint8Array(0));
  const gyroBufferRef = useRef<Uint8Array[]>([]);
  const stickRecordingRef = useRef(false);
  const stickMinsRef = useRef<Uint8Array>(new Uint8Array(0));
  const stickMaxsRef = useRef<Uint8Array>(new Uint8Array(0));
  const stickCounterBytesRef = useRef(new Set<number>());
  const stickSamplesRef = useRef(0);
  const stickStableCountRef = useRef(0);
  const stickLastTop2Ref = useRef('');
  const activeStickRef = useRef<StickSide | null>(null);
  const stickBufferRef = useRef<Uint8Array[]>([]);
  const capturedStickBytesRef = useRef(new Set<number>());
  const leftStickBytesRef = useRef(new Set<number>());
  const rightStickBytesRef = useRef(new Set<number>());
  const finalizeStickRef = useRef<(c1: StickCandidate, c2: StickCandidate | null) => void>(() => {});
  const triggerRecordingRef = useRef(false);
  const triggerMinsRef = useRef<Uint8Array>(new Uint8Array(0));
  const triggerMaxsRef = useRef<Uint8Array>(new Uint8Array(0));
  const triggerSamplesRef = useRef(0);
  const triggerStableCountRef = useRef(0);
  const triggerLastTopRef = useRef('');
  const activeTriggerRef = useRef<TriggerSide | null>(null);
  const triggerBufferRef = useRef<Uint8Array[]>([]);
  const capturedTriggerBytesRef = useRef(new Set<number>());
  const leftTriggerByteRef = useRef<number | null>(null);
  const rightTriggerByteRef = useRef<number | null>(null);
  const finalizeTriggerRef = useRef<(c: StickCandidate) => void>(() => {});
  const byteStatusesRef = useRef<ByteStatus[]>([]);
  const idleRecordBufRef = useRef<{ byteIndices: number[]; frames: number[][] }>({ byteIndices: [], frames: [] });
  const idleRecordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestBytesRef = useRef<Uint8Array>(new Uint8Array(0));

  useEffect(() => { latestBytesRef.current = latestBytes; }, [latestBytes]);

  // ── Synced setters ──
  const setActiveIndex = (i: number) => { activeIdxRef.current = i; _setActiveIndex(i); };
  const setCaptureState = (s: CaptureState) => { captureStateRef.current = s; _setCaptureState(s); };
  const setAxisSubStep = (s: AxisSubStep) => { axisSubStepRef.current = s; _setAxisSubStep(s); };
  const setItems: typeof _setItems = (u) => {
    _setItems(prev => { const next = typeof u === 'function' ? u(prev) : u; itemsRef.current = next; return next; });
  };
  const setInputPhaseActiveWrapped = (v: boolean) => { inputPhaseActiveRef.current = v; setInputPhaseActive(v); };
  const setAutoAdvanceWrapped = (v: boolean) => { autoAdvanceRef.current = v; setAutoAdvance(v); };

  const addLog = useCallback((msg: string) => setLog(prev => [...prev.slice(-199), msg]), []);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  // ── Device auto-detect + SDL selection ──
  const { selectedProfileId, selectedSdlVidPid, hasGyro, sdlOptions, handleSdlSelect } = useDeviceAutoDetect(addLog);
  const rawInfoRef = useDeviceRawInfo(deviceKey);
  const { info: platformInfo } = usePlatform();
  const appVersion = useAppVersion();

  // ── Core callbacks ──
  const updateByteStatuses = useCallback((len: number) => {
    const statuses = computeByteStatuses(len, excludedRef.current, capturedStickBytesRef.current, capturedTriggerBytesRef.current, itemsRef.current);
    byteStatusesRef.current = statuses; setByteStatuses([...statuses]);
  }, []);

  const doAdvance = useCallback(() => {
    const curItems = itemsRef.current; let nextIdx = activeIdxRef.current + 1;
    while (nextIdx < curItems.length) { const it = curItems[nextIdx]; if (STICK_IDS.has(it.id) || TRIGGER_IDS.has(it.id)) { nextIdx++; continue; } if (it.status !== 'captured' && it.status !== 'skipped') break; nextIdx++; }
    if (nextIdx >= curItems.length) { setInputPhaseActiveWrapped(false); addLog('All inputs mapped!'); return; }
    setActiveIndex(nextIdx); setCaptureState('waiting-press'); setAxisSubStep('pos');
    releaseCountRef.current = 0; confirmCountRef.current = 0; detectedBtnRef.current = null;
    setItems(prev => prev.map((it, i) => i === nextIdx ? { ...it, status: 'active' } : it));
  }, [addLog]);

  // ── Idle recording ──
  const handleIdleRecord = useCallback((label: string, byteIndices: number[]) => {
    setIdleRecording(label); idleRecordBufRef.current = { byteIndices, frames: [] };
    addLog(`Recording idle bytes [${byteIndices.join(',')}] for ${label}...`);
    const sample = () => { const bytes = latestBytesRef.current; if (bytes.length > 0) idleRecordBufRef.current.frames.push(byteIndices.map(i => bytes[i] ?? 0)); };
    const iv = setInterval(sample, 8);
    idleRecordTimerRef.current = setTimeout(() => {
      clearInterval(iv); const { frames, byteIndices: idxs } = idleRecordBufRef.current;
      if (frames.length === 0) { setIdleRecording(null); return; }
      const analysis = idxs.map((byteIdx, col) => { const values = frames.map(f => f[col]); const min = Math.min(...values), max = Math.max(...values); const unique = [...new Set(values)].sort((a, b) => a - b); const avg = values.reduce((s, v) => s + v, 0) / values.length; return { byteIndex: byteIdx, min, max, range: max - min, average: Math.round(avg), uniqueCount: unique.length, uniqueValues: unique.length <= 32 ? unique : `${unique.length} values` }; });
      const out: IdleRecordResult = { label, durationMs: 3000, frameCount: frames.length, bytes: analysis };
      setIdleResults(prev => ({ ...prev, [label]: out })); navigator.clipboard.writeText(JSON.stringify(out, null, 2));
      addLog(`✓ Idle recorded for ${label}: ${frames.length} frames. Copied to clipboard.`); setIdleRecording(null);
    }, 3000);
  }, [addLog]);

  // ── Actions (delegated) ──
  const actions = useCalibrationActions({
    latestBytes, gyroExcluded, stickPickMode, stickPickedBytes, triggerPickMode, triggerPickedByte, selectedProfileId, profile, idleResults,
    baselineRef, excludedRef, capturedStickBytesRef, capturedTriggerBytesRef, leftStickBytesRef, rightStickBytesRef, leftTriggerByteRef, rightTriggerByteRef,
    activeStickRef, activeTriggerRef, stickMinsRef, stickMaxsRef, stickCounterBytesRef, stickSamplesRef, stickStableCountRef, stickLastTop2Ref, stickBufferRef, stickRecordingRef,
    triggerMinsRef, triggerMaxsRef, triggerSamplesRef, triggerStableCountRef, triggerLastTopRef, triggerBufferRef, triggerRecordingRef,
    gyroMinsRef, gyroMaxsRef, gyroBufferRef, gyroRecordingRef, finalizeStickRef, finalizeTriggerRef,
    activeIdxRef, advanceTimerRef, itemsRef, releaseCountRef, confirmCountRef, detectedBtnRef, inputPhaseActiveRef, deviceInfoRef, rawInfoRef,
    platform: platformInfo.os, appVersion,
    addLog, updateByteStatuses, doAdvance, setItems, setActiveIndex, setCaptureState, setAxisSubStep, setAutoAdvanceWrapped, setInputPhaseActiveWrapped,
    setGyroState, setGyroChangedBytes, setGyroExcluded, setIdleState, setActiveStick, setStickBusy, setStickLiveInfo, setStickPickMode, setStickPickedBytes,
    setActiveTrigger, setTriggerBusy, setTriggerLiveInfo, setTriggerPickMode, setTriggerPickedByte, setProfile, setPhase, onComplete,
  });

  // ── Report subscription ──
  useEffect(() => {
    if (phase !== 'live') return;
    const unsub = webHidReader.onRawReport((report: WebHidRawReport) => {
      if (deviceKey && report.deviceKey !== deviceKey) return;
      const bytes = new Uint8Array(report.bytes); setLatestBytes(bytes); lastReportIdRef.current = report.reportId;
      if (byteStatusesRef.current.length === 0 && bytes.length > 0) updateByteStatuses(bytes.length);
      const keys = webHidReader.getConnectedDeviceKeys();
      if (keys.length > 0 && deviceInfoRef.current.vendorId === 0) { const k = deviceKey ?? keys[0]; const [v, p] = k.split(':'); deviceInfoRef.current.vendorId = parseInt(v, 16); deviceInfoRef.current.productId = parseInt(p, 16); }
      deviceInfoRef.current.reportId = report.reportId; deviceInfoRef.current.reportLength = bytes.length;
      if (gyroRecordingRef.current) { processGyroFrame(bytes, { gyroMinsRef, gyroMaxsRef, gyroBufferRef }, setGyroChangedBytes); return; }
      if (stickRecordingRef.current) { processStickFrame(bytes, { stickMinsRef, stickMaxsRef, stickCounterBytesRef, stickSamplesRef, stickStableCountRef, stickLastTop2Ref, stickBufferRef, capturedStickBytesRef, excludedRef, baselineRef }, setStickLiveInfo, (c1, c2) => finalizeStickRef.current(c1, c2), () => { stickRecordingRef.current = false; setStickBusy(false); }); return; }
      if (triggerRecordingRef.current) { processTriggerFrame(bytes, { triggerMinsRef, triggerMaxsRef, triggerSamplesRef, triggerStableCountRef, triggerLastTopRef, triggerBufferRef, capturedStickBytesRef, capturedTriggerBytesRef, excludedRef, baselineRef }, setTriggerLiveInfo, (c) => finalizeTriggerRef.current(c), () => { triggerRecordingRef.current = false; setTriggerBusy(false); }); return; }
      processButtonFrame(bytes, { activeIdxRef, captureStateRef, axisSubStepRef, itemsRef, releaseCountRef, detectedBtnRef, confirmCountRef, axisCapRef, advanceTimerRef, autoAdvanceRef, inputPhaseActiveRef, baselineRef, excludedRef }, { setCaptureState, setAxisSubStep, setItems, addLog, updateByteStatuses, doAdvance });
    });
    return () => { unsub(); if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current); };
  }, [phase, addLog, doAdvance, updateByteStatuses, deviceKey]);

  // Same live bytes, run through the real parser — parallel to the raw-report
  // subscription above, so this screen shows the shipped code's actual output
  // alongside the raw-byte diffing, not instead of it.
  useEffect(() => {
    if (phase !== 'live') return;
    const unsub = webHidReader.onInput((state: WebHidInputState) => {
      if (deviceKey && state.deviceKey !== deviceKey) return;
      setLiveParsedState(state);
    });
    return unsub;
  }, [phase, deviceKey]);

  // ── Derived ──
  const prereqsDone = (hasGyro ? gyroState === 'done' : true) && idleState === 'done';
  const capturedCount = items.filter(it => it.status === 'captured' || it.status === 'skipped').length;
  const buttonItems = items.filter(it => !STICK_IDS.has(it.id) && !TRIGGER_IDS.has(it.id));
  const buttonCapturedCount = buttonItems.filter(it => it.status === 'captured' || it.status === 'skipped').length;

  return {
    phase, profile, hasGyro, selectedProfileId, selectedSdlVidPid, gyroState, idleState, gyroExcluded,
    activeStick, stickBusy, stickLiveInfo, stickPickMode, stickPickedBytes,
    activeTrigger, triggerBusy, triggerLiveInfo, triggerPickMode, triggerPickedByte,
    items, activeIndex, captureState, axisSubStep, inputPhaseActive, autoAdvance,
    latestBytes, byteStatuses, gyroChangedBytes, log, idleRecording, idleResults, liveParsedState,
    prereqsDone, capturedCount, buttonItems, buttonCapturedCount,
    lastReportId: lastReportIdRef.current,
    logRef, excludedRef, baselineRef, itemsRef, activeIdxRef, inputPhaseActiveRef,
    sdlOptions, handleSdlSelect, handleIdleRecord,
    setAutoAdvanceWrapped, setInputPhaseActiveWrapped,
    ...actions,
    getInstruction: () => getInstructionText(inputPhaseActive, items, activeIndex, captureState, axisSubStep),
    getByteColor: (idx: number): ByteColorResult => getByteColor(idx, byteStatuses, gyroState, gyroChangedBytes),
  };
};

export { useHidCalibration };
