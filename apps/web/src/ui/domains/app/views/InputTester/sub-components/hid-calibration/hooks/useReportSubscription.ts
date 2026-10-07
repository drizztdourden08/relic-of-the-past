/* @layer renderer-components @kind hook */
/**
 * The two live-report subscriptions the wizard depends on: raw HID bytes
 * (fanned out to gyro/stick/trigger/button frame processing) and the same
 * bytes run through the real shipped parser, for the parallel
 * LiveParserOutput panel. Split out of useHidCalibration.ts for file-size
 * compliance. No behavior of its own beyond wiring those two together.
 */
import { useEffect } from 'react';
import { controllerInputStore } from '../../../../../../../../lib/input/controller-input-store';
import type { ControllerInputState, HidRawReportEvent } from '../../../../../../../../lib/input/controller-input-store';
import type { AxisSubStep, CaptureState, InputItem, Phase } from '../hid-calibration.type';
import { processGyroFrame, processStickFrame, processTriggerFrame } from '../report-processing';
import { processButtonFrame } from '../button-detection';
import { observeFrame } from '../noisy-bytes';
import { observeIdleFrame } from '../stick-center';
import { applyVidPid } from '../wizard-helpers';
import type { useCalibrationRefs } from './useCalibrationRefs';

type CalibrationRefs = ReturnType<typeof useCalibrationRefs>;

interface ReportSubscriptionCallbacks {
  setLatestBytes: (bytes: Uint8Array) => void;
  setLiveParsedState: (state: ControllerInputState) => void;
  setGyroChangedBytes: (changed: Set<number>) => void;
  setStickLiveInfo: (info: string) => void;
  setStickBusy: (v: boolean) => void;
  setTriggerLiveInfo: (info: string) => void;
  setTriggerBusy: (v: boolean) => void;
  setCaptureState: (s: CaptureState) => void;
  setAxisSubStep: (s: AxisSubStep) => void;
  setItems: (updater: (prev: InputItem[]) => InputItem[]) => void;
  addLog: (msg: string) => void;
  updateByteStatuses: (len: number) => void;
  doAdvance: () => void;
}

const useReportSubscription = (phase: Phase, deviceKey: string | undefined, refs: CalibrationRefs, cb: ReportSubscriptionCallbacks): void => {
  useEffect(() => {
    if (phase !== 'live') return;
    const unsub = controllerInputStore.onRawReport((report: HidRawReportEvent) => {
      if (deviceKey && report.deviceKey !== deviceKey) return;
      const bytes = new Uint8Array(report.bytes); cb.setLatestBytes(bytes); refs.lastReportIdRef.current = report.reportId;
      if (refs.byteStatusesRef.current.length === 0 && bytes.length > 0) cb.updateByteStatuses(bytes.length);
      // Every frame, whichever step is running: what counts as restless has to
      // be known before the first capture, not after a stick pass.
      observeFrame(refs.noiseRef.current, bytes);
      // The report itself already names its device, so there is no need to guess from a
      // separately-tracked "connected" set (and reported != connected anyway).
      if (refs.deviceInfoRef.current.vendorId === 0) applyVidPid(refs.deviceInfoRef, deviceKey ?? report.deviceKey);
      refs.deviceInfoRef.current.reportId = report.reportId; refs.deviceInfoRef.current.reportLength = bytes.length;
      if (refs.gyroRecordingRef.current) { processGyroFrame(bytes, refs, cb.setGyroChangedBytes); return; }
      // An idle reading runs after a stick is already mapped, so it takes
      // these frames ahead of every capture branch.
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

  // Same live bytes, run through the real parser. Parallel to the raw-report
  // subscription above, so this screen shows the shipped code's actual output
  // alongside the raw-byte diffing, not instead of it.
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
