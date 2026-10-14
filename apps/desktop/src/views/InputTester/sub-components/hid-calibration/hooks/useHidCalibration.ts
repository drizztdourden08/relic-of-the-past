/* @layer renderer-components @kind hook */
import { useState, useEffect, useCallback } from 'react';
import { usePlatform } from '@drizztdourden08/brock-react';
import { useAppVersion } from '@app/hooks/useAppVersion';
import type { ControllerInputState } from '../../../../../input/controller-input-store';
import type { DeviceProfile } from '@rotp/input-mapping';
import type { ByteStatus, Phase } from '../hid-calibration.type';
import { useCalibrationActions } from './useCalibrationActions';
import { useCalibrationBootstrap } from './useCalibrationBootstrap';
import { useCalibrationItemState } from './useCalibrationItemState';
import { useCalibrationLog } from './useCalibrationLog';
import { useDeviceAutoDetect } from './useDeviceAutoDetect';
import { useDeviceRawInfo } from './useDeviceRawInfo';
import { useDoAdvance } from './useDoAdvance';
import { useWizardRawCapture } from './useWizardRawCapture';
import { useIdleByteRecording } from './useIdleByteRecording';
import { useFlakyByteWarning } from './useFlakyByteWarning';
import { useCalibrationRefs } from './useCalibrationRefs';
import { useGyroIdleState } from './useGyroIdleState';
import { useReportSubscription } from './useReportSubscription';
import { useSdlVersion } from './useSdlVersion';
import { useStickTriggerState } from './useStickTriggerState';
import { useUpdateByteStatuses } from './useUpdateByteStatuses';
import { flakyDialogProps } from './flaky-dialog-props';
import { isAnalogItem } from './is-analog-item';
import { isItemDone } from './is-item-done';
import { wizardGetters } from './wizard-getters';
import type { UseHidCalibrationProps } from './hid-calibration-hook.type';

const useHidCalibration = (props: UseHidCalibrationProps) => {
  const { onComplete, deviceKey, initialProfile, capturedEntry, initialProfileId, initialHasGyro } = props;

  const [profile, setProfile] = useState<DeviceProfile | null>(null);
  const [phase, setPhase] = useState<Phase>('select-profile');
  const [latestBytes, setLatestBytes] = useState<Uint8Array>(new Uint8Array(0));
  const [byteStatuses, setByteStatuses] = useState<ByteStatus[]>([]);
  const [liveParsedState, setLiveParsedState] = useState<ControllerInputState | null>(null);
  const gyroIdle = useGyroIdleState();
  const stickTrigger = useStickTriggerState();

  const refs = useCalibrationRefs();
  const { logRef, excludedRef, baselineRef, itemsRef, activeIdxRef, inputPhaseActiveRef, latestBytesRef, lastReportIdRef } = refs;
  const itemState = useCalibrationItemState(refs);

  useEffect(() => { latestBytesRef.current = latestBytes; }, [latestBytes]);

  const { log, addLog } = useCalibrationLog(logRef);

  const { selectedProfileId, selectedSdlVidPid, hasGyro, sdlOptions, handleSdlSelect, detectedProfile } = useDeviceAutoDetect({
    addLog, initialProfileId, initialHasGyro, deviceKey, initialProfile,
  });
  const rawInfoRef = useDeviceRawInfo(deviceKey);
  const { info: platformInfo } = usePlatform();
  const appVersion = useAppVersion();
  const sdlVersion = useSdlVersion();
  const { rawAvailable, rawUnavailableReason } = useWizardRawCapture(phase, deviceKey);

  const updateByteStatuses = useUpdateByteStatuses(refs, setByteStatuses);
  const doAdvance = useDoAdvance({ refs, itemState, addLog });
  const { idleRecording, idleResults, handleIdleRecord, recordIdleResult } = useIdleByteRecording(latestBytesRef, addLog);
  const flakyWarning = useFlakyByteWarning(latestBytesRef, excludedRef, gyroIdle.setGyroExcluded);

  const actions = useCalibrationActions({
    ...refs, ...itemState, ...gyroIdle, ...stickTrigger,
    latestBytes, selectedProfileId, detectedProfile, profile, idleResults, recordIdleResult,
    rawInfoRef, platform: platformInfo.os, appVersion, capturedEntry, sdlVersion,
    addLog, updateByteStatuses, doAdvance, setProfile, setPhase, onComplete,
  });

  useCalibrationBootstrap({ phase, deviceKey, detectedProfile, handleProfileConfirm: actions.handleProfileConfirm, deviceInfoRef: refs.deviceInfoRef });

  useReportSubscription(phase, deviceKey, refs, {
    setLatestBytes, setLiveParsedState, setGyroChangedBytes: gyroIdle.setGyroChangedBytes,
    setStickLiveInfo: stickTrigger.setStickLiveInfo, setStickBusy: stickTrigger.setStickBusy,
    setTriggerLiveInfo: stickTrigger.setTriggerLiveInfo, setTriggerBusy: stickTrigger.setTriggerBusy,
    setCaptureState: itemState.setCaptureState, setAxisSubStep: itemState.setAxisSubStep, setItems: itemState.setItems,
    addLog, updateByteStatuses, doAdvance,
  });

  const handleStartButtonsChecked = useCallback(() => {
    flakyWarning.checkBeforeStart(actions.handleStartButtons);
  }, [flakyWarning.checkBeforeStart, actions.handleStartButtons]);

  const buttonItems = itemState.items.filter(it => !isAnalogItem(it));

  return {
    phase, profile, hasGyro, selectedProfileId, selectedSdlVidPid, ...gyroIdle, ...stickTrigger, ...itemState,
    latestBytes, byteStatuses, log, idleRecording, idleResults, liveParsedState, rawAvailable, rawUnavailableReason,
    prereqsDone: (hasGyro ? gyroIdle.gyroState === 'done' : true) && gyroIdle.idleState === 'done',
    capturedCount: itemState.items.filter(isItemDone).length,
    buttonItems, buttonCapturedCount: buttonItems.filter(isItemDone).length,
    lastReportId: lastReportIdRef.current,
    logRef, excludedRef, baselineRef, itemsRef, activeIdxRef, inputPhaseActiveRef,
    sdlOptions, handleSdlSelect, handleIdleRecord, detectedProfile,
    ...actions,
    handleStartButtons: handleStartButtonsChecked,
    ...flakyDialogProps(flakyWarning),
    ...wizardGetters({ itemState, byteStatuses, gyroIdle }),
  };
};

export { useHidCalibration };
