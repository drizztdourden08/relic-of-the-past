/* @layer renderer-components @kind hook */
import { useEffect } from 'react';
import { controllerInputStore } from '../../../../../input/controller-input-store';
import type { ControllerInputState, HidRawReportEvent } from '../../../../../input/controller-input-store';
import type { Phase } from '../hid-calibration.type';
import { processGyroFrame, processStickFrame, processTriggerFrame } from '../report-processing';
import { processButtonFrame } from '../button-detection';
import { observeFrame } from '../noisy-bytes';
import { observeIdleFrame } from '../stick-center';
import { applyVidPid } from '../apply-vid-pid';
import type { CalibrationRefs, ReportSubscriptionCallbacks } from './useReportSubscription.type';

const useReportSubscription = (phase: Phase, deviceKey: string | undefined, refs: CalibrationRefs, cb: ReportSubscriptionCallbacks): void => {
  useEffect(() => {
    if (phase !== 'live') return;
    const unsub = controllerInputStore.onRawReport((report: HidRawReportEvent) => {
      if (deviceKey && report.deviceKey !== deviceKey) return;
      const bytes = new Uint8Array(report.bytes); cb.setLatestBytes(bytes); refs.lastReportIdRef.current = report.reportId;
      if (refs.byteStatusesRef.current.length === 0 && bytes.length > 0) cb.updateByteStatuses(bytes.length);
      observeFrame(refs.noiseRef.current, bytes);
      if (refs.deviceInfoRef.current.vendorId === 0) applyVidPid(refs.deviceInfoRef, deviceKey ?? report.deviceKey);
      refs.deviceInfoRef.current.reportId = report.reportId; refs.deviceInfoRef.current.reportLength = bytes.length;
      if (refs.gyroRecordingRef.current) { processGyroFrame(bytes, refs, cb.setGyroChangedBytes); return; }
      if (refs.stickIdleRef.current) {
        const { done, progress } = observeIdleFrame(refs.stickIdleRef.current, bytes, Date.now());
        cb.setStickLiveInfo(done ? '' : `Reading idle... ${Math.round(progress * 100)}%`);
        if (done) {
          refs.stickIdleRef.current = null;
          refs.applyIdleRef.current(done);
        }
        return;
      }
      if (refs.stickRecordingRef.current) {
        processStickFrame(bytes, refs, cb.setStickLiveInfo, (c1, c2) => refs.finalizeStickRef.current(c1, c2),
          () => { refs.stickRecordingRef.current = false; cb.setStickBusy(false); }, cb.addLog);
        return;
      }
      if (refs.triggerRecordingRef.current) {
        processTriggerFrame(bytes, refs, cb.setTriggerLiveInfo, (c) => refs.finalizeTriggerRef.current(c),
          () => { refs.triggerRecordingRef.current = false; cb.setTriggerBusy(false); },
          (m) => refs.finalizeDigitalTriggerRef.current(m));
        return;
      }
      processButtonFrame(bytes, refs, { setCaptureState: cb.setCaptureState, setAxisSubStep: cb.setAxisSubStep, setItems: cb.setItems, addLog: cb.addLog, updateByteStatuses: cb.updateByteStatuses, doAdvance: cb.doAdvance });
    });
    return () => { unsub(); if (refs.advanceTimerRef.current) clearTimeout(refs.advanceTimerRef.current); };
  }, [phase, deviceKey]);

  useEffect(() => {
    if (phase !== 'live') return;
    const unsub = controllerInputStore.onInput((state: ControllerInputState) => {
      if (deviceKey && state.deviceKey !== deviceKey) return;
      cb.setLiveParsedState(state);
    });
    return unsub;
  }, [phase, deviceKey]);
};

export { useReportSubscription };
