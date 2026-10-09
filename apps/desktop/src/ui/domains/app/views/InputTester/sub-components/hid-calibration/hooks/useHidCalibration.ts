/* @layer renderer-components @kind hook */
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { usePlatform } from '@drizztdourden08/brock-react';
import { useAppVersion } from '@app/hooks/useAppVersion';
import type { ControllerInputState } from '../../../../../../../../lib/input/controller-input-store';
import type { DeviceProfile } from '@rotp/input-mapping';
import type {
  AxisSubStep, ByteColorResult, ByteStatus, CaptureState, GyroState,
  IdleState, InputItem, Phase,
  StickSide, TriggerSide,
} from '../hid-calibration.type';
import { STICK_IDS, TRIGGER_IDS } from '../hid-calibration.constants';
import { applyVidPid } from '../apply-vid-pid';
import { computeByteStatuses } from '../compute-byte-statuses';
import { getInstructionText } from '../instruction-text';
import { getByteColor } from '../wizard-helpers';
import { useCalibrationActions } from './useCalibrationActions';
import { useDeviceAutoDetect } from './useDeviceAutoDetect';
import { useDeviceRawInfo } from './useDeviceRawInfo';
import { useWizardRawCapture } from './useWizardRawCapture';
import { useIdleByteRecording } from './useIdleByteRecording';
import { useFlakyByteWarning } from './useFlakyByteWarning';
import { useCalibrationRefs } from './useCalibrationRefs';
import { useReportSubscription } from './useReportSubscription';
import { useSdlVersion } from './useSdlVersion';
import { LOG_KEEP_LINES } from './useHidCalibration.constants';
import type { UseHidCalibrationProps } from './useHidCalibration.type';

const isDone = (it: InputItem): boolean => it.status === 'captured' || it.status === 'skipped';

const useHidCalibration = (props: UseHidCalibrationProps) => {
  const { onComplete, deviceKey, initialProfile, capturedEntry, initialProfileId, initialHasGyro } = props;

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
  const [liveParsedState, setLiveParsedState] = useState<ControllerInputState | null>(null);

  const refs = useCalibrationRefs();
  const {
    logRef, activeIdxRef, captureStateRef, axisSubStepRef, itemsRef, releaseCountRef, detectedBtnRef,
    confirmCountRef, awaitingButtonRestRef, baselineRef, excludedRef, deviceInfoRef, inputPhaseActiveRef,
    capturedStickBytesRef, capturedTriggerBytesRef, autoAdvanceRef,
    byteStatusesRef, latestBytesRef, lastReportIdRef,
  } = refs;

  useEffect(() => { latestBytesRef.current = latestBytes; }, [latestBytes]);

  const setActiveIndex = (i: number) => { activeIdxRef.current = i; _setActiveIndex(i); };
  const setCaptureState = (s: CaptureState) => { captureStateRef.current = s; _setCaptureState(s); };
  const setAxisSubStep = (s: AxisSubStep) => { axisSubStepRef.current = s; _setAxisSubStep(s); };
  const setItems: typeof _setItems = (u) => {
    const next = typeof u === 'function' ? (u as (prev: InputItem[]) => InputItem[])(itemsRef.current) : u;
    itemsRef.current = next;
    _setItems(next);
  };
  const setInputPhaseActiveWrapped = (v: boolean) => { inputPhaseActiveRef.current = v; setInputPhaseActive(v); };
  const setAutoAdvanceWrapped = (v: boolean) => { autoAdvanceRef.current = v; setAutoAdvance(v); };

  const addLog = useCallback((msg: string) => setLog(prev => [...prev.slice(-LOG_KEEP_LINES), msg]), []);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  const { selectedProfileId, selectedSdlVidPid, hasGyro, sdlOptions, handleSdlSelect, detectedProfile } = useDeviceAutoDetect(addLog, initialProfileId, initialHasGyro, deviceKey, initialProfile);
  const rawInfoRef = useDeviceRawInfo(deviceKey);
  const { info: platformInfo } = usePlatform();
  const appVersion = useAppVersion();
  const sdlVersion = useSdlVersion();
  const { rawAvailable, rawUnavailableReason } = useWizardRawCapture(phase, deviceKey);

  const updateByteStatuses = useCallback((len: number) => {
    const statuses = computeByteStatuses(len, excludedRef.current, capturedStickBytesRef.current, capturedTriggerBytesRef.current, itemsRef.current);
    byteStatusesRef.current = statuses; setByteStatuses([...statuses]);
  }, []);

  const doAdvance = useCallback(() => {
    const curItems = itemsRef.current; let nextIdx = activeIdxRef.current + 1;
    while (nextIdx < curItems.length) { const it = curItems[nextIdx]; if (STICK_IDS.has(it.id) || TRIGGER_IDS.has(it.id)) { nextIdx++; continue; } if (!isDone(it)) break; nextIdx++; }
    if (nextIdx >= curItems.length) { setInputPhaseActiveWrapped(false); addLog('All inputs mapped!'); return; }
    setActiveIndex(nextIdx); setCaptureState('waiting-press'); setAxisSubStep('pos');
    releaseCountRef.current = 0; confirmCountRef.current = 0; detectedBtnRef.current = null; awaitingButtonRestRef.current = true;
    setItems(prev => prev.map((it, i) => i === nextIdx ? { ...it, status: 'active' } : it));
  }, [addLog]);

  const { idleRecording, idleResults, handleIdleRecord, recordIdleResult } = useIdleByteRecording(latestBytesRef, addLog);
  const flakyWarning = useFlakyByteWarning(latestBytesRef, excludedRef, setGyroExcluded);

  const actions = useCalibrationActions({
    ...refs,
    latestBytes, gyroExcluded, stickPickMode, stickPickedBytes, triggerPickMode, triggerPickedByte, selectedProfileId, detectedProfile, profile, idleResults, recordIdleResult,
    rawInfoRef,
    platform: platformInfo.os, appVersion, capturedEntry, sdlVersion,
    addLog, updateByteStatuses, doAdvance, setItems, setActiveIndex, setCaptureState, setAxisSubStep, setAutoAdvanceWrapped, setInputPhaseActiveWrapped,
    setGyroState, setGyroChangedBytes, setGyroExcluded, setIdleState, setActiveStick, setStickBusy, setStickLiveInfo, setStickPickMode, setStickPickedBytes,
    setActiveTrigger, setTriggerBusy, setTriggerLiveInfo, setTriggerPickMode, setTriggerPickedByte, setProfile, setPhase, onComplete,
  });

  const autoConfirmedRef = useRef(false);
  useLayoutEffect(() => {
    if (autoConfirmedRef.current || phase !== 'select-profile' || !detectedProfile) return;
    autoConfirmedRef.current = true;
    actions.handleProfileConfirm();
  }, [phase, detectedProfile, actions]);

  useEffect(() => {
    if (phase === 'live' && deviceKey) applyVidPid(deviceInfoRef, deviceKey);
  }, [phase, deviceKey]);

  useReportSubscription(phase, deviceKey, refs, {
    setLatestBytes, setLiveParsedState, setGyroChangedBytes,
    setStickLiveInfo, setStickBusy, setTriggerLiveInfo, setTriggerBusy,
    setCaptureState, setAxisSubStep, setItems, addLog, updateByteStatuses, doAdvance,
  });

  const handleStartButtonsChecked = useCallback(() => {
    flakyWarning.checkBeforeStart(actions.handleStartButtons);
  }, [flakyWarning.checkBeforeStart, actions.handleStartButtons]);

  const prereqsDone = (hasGyro ? gyroState === 'done' : true) && idleState === 'done';
  const capturedCount = items.filter(isDone).length;
  const buttonItems = items.filter(it => !STICK_IDS.has(it.id) && !TRIGGER_IDS.has(it.id));
  const buttonCapturedCount = buttonItems.filter(isDone).length;

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
