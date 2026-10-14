/* @layer renderer-components @kind hook */
import { useEffect } from 'react';
import { controllerInputStore } from '../../../../../input/controller-input-store';
import type { ControllerInputState, HidRawReportEvent } from '../../../../../input/controller-input-store';
import type { Phase } from '../hid-calibration.type';
import { dispatchRawReport } from './dispatch-raw-report';
import type { CalibrationRefs, ReportSubscriptionCallbacks } from './report-subscription.type';

const useReportSubscription = (phase: Phase, deviceKey: string | undefined, refs: CalibrationRefs, cb: ReportSubscriptionCallbacks): void => {
  useEffect(() => {
    if (phase !== 'live') return;
    const unsub = controllerInputStore.onRawReport((report: HidRawReportEvent) => {
      dispatchRawReport({ report, deviceKey, refs, cb });
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
