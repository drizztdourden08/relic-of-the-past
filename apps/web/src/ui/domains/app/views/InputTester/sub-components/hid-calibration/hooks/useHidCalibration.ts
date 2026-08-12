/* @layer renderer-components @kind hook */
/**
 * Core state machine hook for the HID Calibration Wizard.
 * Declares state/refs and delegates action handlers to useCalibrationActions.
 */
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { usePlatform } from '@app/platform';
import { useAppVersion } from '@app/hooks/useAppVersion';
import type { ControllerInputState } from '../../../../../../../../lib/input/controller-input-store';
import type { DeviceProfile } from '@shared/input';
import type { DeviceEntry } from '@shared/ipc';
import type {
  AxisSubStep, ByteStatus, CaptureState, GyroState, HidControllerMap,
  IdleState, InputItem, Phase,
  StickSide, TriggerSide,
} from '../hid-calibration.type';
import { STICK_IDS, TRIGGER_IDS } from '../hid-calibration.constants';
import { applyVidPid, computeByteStatuses, getInstructionText, getByteColor } from '../wizard-helpers';
import type { ByteColorResult } from '../wizard-helpers';
import { useCalibrationActions } from './useCalibrationActions';
import { useDeviceAutoDetect } from './useDeviceAutoDetect';
import { useDeviceRawInfo } from './useDeviceRawInfo';
import { useWizardRawCapture } from './useWizardRawCapture';
import { useIdleByteRecording } from './useIdleByteRecording';
import { useFlakyByteWarning } from './useFlakyByteWarning';
import { useCalibrationRefs } from './useCalibrationRefs';
import { useReportSubscription } from './useReportSubscription';

interface UseHidCalibrationProps {
  onComplete: (map: HidControllerMap) => void;
  onCancel: () => void;
  deviceKey?: string;
  initialProfile?: DeviceProfile | null;
  capturedEntry?: DeviceEntry | null;
  initialProfileId?: string;
  initialHasGyro?: boolean;
}

const useHidCalibration = (props: UseHidCalibrationProps) => {
  const { onComplete, deviceKey, initialProfile, capturedEntry, initialProfileId, initialHasGyro } = props;

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
  // What SDL3's own already-decoded state reports for these same live bytes
  // — not a re-guess.
  const [liveParsedState, setLiveParsedState] = useState<ControllerInputState | null>(null);

  // ── Refs ── (declared in useCalibrationRefs.ts for file-size compliance)
  const refs = useCalibrationRefs();
  const {
    logRef, activeIdxRef, captureStateRef, axisSubStepRef, itemsRef, releaseCountRef, detectedBtnRef,
    confirmCountRef, awaitingButtonRestRef, baselineRef, excludedRef, deviceInfoRef, inputPhaseActiveRef,
    capturedStickBytesRef, capturedTriggerBytesRef, autoAdvanceRef,
    byteStatusesRef, latestBytesRef, lastReportIdRef,
  } = refs;

  useEffect(() => { latestBytesRef.current = latestBytes; }, [latestBytes]);

  // ── Synced setters ──
  const setActiveIndex = (i: number) => { activeIdxRef.current = i; _setActiveIndex(i); };
  const setCaptureState = (s: CaptureState) => { captureStateRef.current = s; _setCaptureState(s); };
  const setAxisSubStep = (s: AxisSubStep) => { axisSubStepRef.current = s; _setAxisSubStep(s); };
  // The ref is updated here, at call time, rather than inside the updater React
  // runs later. Everything in this wizard reads itemsRef, including the byte
  // status computation that finalizers call on the line after setItems, so
  // assigning it late made those read one capture behind: the byte a capture
  // had just claimed kept the previous item's colour.
  const setItems: typeof _setItems = (u) => {
    const next = typeof u === 'function' ? (u as (prev: InputItem[]) => InputItem[])(itemsRef.current) : u;
    itemsRef.current = next;
    _setItems(next);
  };
  const setInputPhaseActiveWrapped = (v: boolean) => { inputPhaseActiveRef.current = v; setInputPhaseActive(v); };
  const setAutoAdvanceWrapped = (v: boolean) => { autoAdvanceRef.current = v; setAutoAdvance(v); };

  const addLog = useCallback((msg: string) => setLog(prev => [...prev.slice(-199), msg]), []);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  // ── Device auto-detect + SDL selection ──
  const { selectedProfileId, selectedSdlVidPid, hasGyro, sdlOptions, handleSdlSelect, detectedProfile } = useDeviceAutoDetect(addLog, initialProfileId, initialHasGyro, deviceKey, initialProfile);
  const rawInfoRef = useDeviceRawInfo(deviceKey);
  const { info: platformInfo } = usePlatform();
  const appVersion = useAppVersion();
  // Recorded in the report: which SDL produced these readings.
  const [sdlVersion, setSdlVersion] = useState<string | null>(null);
  useEffect(() => { window.api.sdlVersion().then(setSdlVersion).catch(() => setSdlVersion(null)); }, []);
  const { rawAvailable, rawUnavailableReason } = useWizardRawCapture(phase, deviceKey);

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
    releaseCountRef.current = 0; confirmCountRef.current = 0; detectedBtnRef.current = null; awaitingButtonRestRef.current = true;
    setItems(prev => prev.map((it, i) => i === nextIdx ? { ...it, status: 'active' } : it));
  }, [addLog]);

  // ── Idle recording ──
  const { idleRecording, idleResults, handleIdleRecord, recordIdleResult } = useIdleByteRecording(latestBytesRef, addLog);

  // ── Flaky-byte warning, gating button capture (item 5) ──
  const flakyWarning = useFlakyByteWarning(latestBytesRef, excludedRef, setGyroExcluded);

  // ── Actions (delegated) ── refs spread from useCalibrationRefs() satisfies
  // ActionDeps' ref fields structurally; only the non-ref state/callbacks need
  // to be listed explicitly here.
  const actions = useCalibrationActions({
    ...refs,
    latestBytes, gyroExcluded, stickPickMode, stickPickedBytes, triggerPickMode, triggerPickedByte, selectedProfileId, detectedProfile, profile, idleResults, recordIdleResult,
    rawInfoRef,
    platform: platformInfo.os, appVersion, capturedEntry, sdlVersion,
    addLog, updateByteStatuses, doAdvance, setItems, setActiveIndex, setCaptureState, setAxisSubStep, setAutoAdvanceWrapped, setInputPhaseActiveWrapped,
    setGyroState, setGyroChangedBytes, setGyroExcluded, setIdleState, setActiveStick, setStickBusy, setStickLiveInfo, setStickPickMode, setStickPickedBytes,
    setActiveTrigger, setTriggerBusy, setTriggerLiveInfo, setTriggerPickMode, setTriggerPickedByte, setProfile, setPhase, onComplete,
  });

  // Skips the profile-picker screen when a host already resolved a device
  // and profile itself (see HidCalibrationWizardProps.initialProfileId).
  // detectedProfile resolves asynchronously (it reads the live capability
  // list), so this waits for it rather than firing off selectedProfileId
  // alone — that state is set synchronously from initialProfileId and would
  // otherwise race handleProfileConfirm into bailing on a still-null profile,
  // permanently, since autoConfirmedRef only ever tries once.
  // useLayoutEffect so the picker never paints even for a single frame.
  const autoConfirmedRef = useRef(false);
  useLayoutEffect(() => {
    if (autoConfirmedRef.current || phase !== 'select-profile' || !detectedProfile) return;
    autoConfirmedRef.current = true;
    actions.handleProfileConfirm();
  }, [phase, detectedProfile, actions]);

  // Populates identity directly from the chosen device as soon as it's known,
  // rather than only from getDevicesThatHaveReported() on a raw report: that list
  // is gamepad-level, so a device captured with SDL's hold released (the
  // diagnostics wizard's byte-capture step) never appears in it, which left
  // vendorId/productId stuck at 0 for that entire capture.
  useEffect(() => {
    if (phase === 'live' && deviceKey) applyVidPid(deviceInfoRef, deviceKey);
  }, [phase, deviceKey]);

  // ── Report subscription (raw bytes + the real parser in parallel) ──
  useReportSubscription(phase, deviceKey, refs, {
    setLatestBytes, setLiveParsedState, setGyroChangedBytes,
    setStickLiveInfo, setStickBusy, setTriggerLiveInfo, setTriggerBusy,
    setCaptureState, setAxisSubStep, setItems, addLog, updateByteStatuses, doAdvance,
  });

  // Runs the flaky-byte check before button capture actually starts, rather
  // than replacing handleStartButtons outright, so the underlying action stays
  // a single well-named thing the check merely gates.
  const handleStartButtonsChecked = useCallback(() => {
    flakyWarning.checkBeforeStart(actions.handleStartButtons);
  }, [flakyWarning.checkBeforeStart, actions.handleStartButtons]);

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
    rawAvailable, rawUnavailableReason,
    prereqsDone, capturedCount, buttonItems, buttonCapturedCount,
    lastReportId: lastReportIdRef.current,
    logRef, excludedRef, baselineRef, itemsRef, activeIdxRef, inputPhaseActiveRef,
    sdlOptions, handleSdlSelect, handleIdleRecord, detectedProfile,
    setAutoAdvanceWrapped, setInputPhaseActiveWrapped,
    ...actions,
    handleStartButtons: handleStartButtonsChecked,
    flakyDialogOpen: flakyWarning.flakyDialogOpen,
    flakyBytes: flakyWarning.flakyBytes,
    flakyLiveRanges: flakyWarning.liveRanges,
    onExcludeFlakyAndContinue: flakyWarning.excludeAndContinue,
    onContinueFlakyAnyway: flakyWarning.continueWithoutExcluding,
    onCancelFlakyDialog: flakyWarning.cancel,
    getInstruction: () => getInstructionText(inputPhaseActive, items, activeIndex, captureState, axisSubStep),
    getByteColor: (idx: number): ByteColorResult => getByteColor(idx, byteStatuses, gyroState, gyroChangedBytes),
  };
};

export { useHidCalibration };
