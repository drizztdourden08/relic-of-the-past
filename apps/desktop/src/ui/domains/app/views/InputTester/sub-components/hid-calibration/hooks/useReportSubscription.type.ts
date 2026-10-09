/* @layer renderer-components @kind types */
import type { ControllerInputState } from '../../../../../../../../lib/input/controller-input-store';
import type { AxisSubStep, CaptureState, InputItem } from '../hid-calibration.type';
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

export type { CalibrationRefs, ReportSubscriptionCallbacks };
