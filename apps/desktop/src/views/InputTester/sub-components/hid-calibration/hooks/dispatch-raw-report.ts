/* @layer renderer-components @kind logic */
import type { HidRawReportEvent } from '../../../../../input/controller-input-store';
import { processGyroFrame, processStickFrame, processTriggerFrame } from '../report-processing';
import { processButtonFrame } from '../button-detection';
import { observeFrame } from '../noisy-bytes';
import { observeIdleFrame } from '../stick-center';
import { applyVidPid } from '../apply-vid-pid';
import type { CalibrationRefs, DispatchRawReportParams, ReportSubscriptionCallbacks } from './report-subscription.type';

const prepareFrame = (report: HidRawReportEvent, deviceKey: string | undefined, refs: CalibrationRefs, cb: ReportSubscriptionCallbacks): Uint8Array => {
  const bytes = new Uint8Array(report.bytes);
  cb.setLatestBytes(bytes);
  refs.lastReportIdRef.current = report.reportId;
  if (refs.byteStatusesRef.current.length === 0 && bytes.length > 0) cb.updateByteStatuses(bytes.length);
  observeFrame(refs.noiseRef.current, bytes);
  if (refs.deviceInfoRef.current.vendorId === 0) applyVidPid(refs.deviceInfoRef, deviceKey ?? report.deviceKey);
  refs.deviceInfoRef.current.reportId = report.reportId;
  refs.deviceInfoRef.current.reportLength = bytes.length;
  return bytes;
};

const processStickIdle = (bytes: Uint8Array, refs: CalibrationRefs, cb: ReportSubscriptionCallbacks): void => {
  const sampler = refs.stickIdleRef.current;
  if (!sampler) return;
  const { done, progress } = observeIdleFrame(sampler, bytes, Date.now());
  cb.setStickLiveInfo(done ? '' : `Reading idle... ${Math.round(progress * 100)}%`);
  if (done) {
    refs.stickIdleRef.current = null;
    refs.applyIdleRef.current(done);
  }
};

const routeFrame = (bytes: Uint8Array, refs: CalibrationRefs, cb: ReportSubscriptionCallbacks): void => {
  if (refs.gyroRecordingRef.current) { processGyroFrame(bytes, refs, cb.setGyroChangedBytes); return; }
  if (refs.stickIdleRef.current) { processStickIdle(bytes, refs, cb); return; }
  if (refs.stickRecordingRef.current) {
    processStickFrame({
      bytes,
      refs,
      onLiveInfo: cb.setStickLiveInfo,
      onFinalize: (c1, c2) => refs.finalizeStickRef.current(c1, c2),
      onStopRecording: () => { refs.stickRecordingRef.current = false; cb.setStickBusy(false); },
      addLog: cb.addLog,
    });
    return;
  }
  if (refs.triggerRecordingRef.current) {
    processTriggerFrame({
      bytes,
      refs,
      onLiveInfo: cb.setTriggerLiveInfo,
      onFinalize: (c) => refs.finalizeTriggerRef.current(c),
      onStopRecording: () => { refs.triggerRecordingRef.current = false; cb.setTriggerBusy(false); },
      onFinalizeDigital: (m) => refs.finalizeDigitalTriggerRef.current(m),
    });
    return;
  }
  processButtonFrame(bytes, refs, {
    setCaptureState: cb.setCaptureState,
    setAxisSubStep: cb.setAxisSubStep,
    setItems: cb.setItems,
    addLog: cb.addLog,
    updateByteStatuses: cb.updateByteStatuses,
    doAdvance: cb.doAdvance,
  });
};

const dispatchRawReport = (params: DispatchRawReportParams): void => {
  const { report, deviceKey, refs, cb } = params;
  if (deviceKey && report.deviceKey !== deviceKey) return;
  routeFrame(prepareFrame(report, deviceKey, refs, cb), refs, cb);
};

export { dispatchRawReport };
