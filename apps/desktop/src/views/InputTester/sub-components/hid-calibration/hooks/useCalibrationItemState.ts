/* @layer renderer-components @kind hook */
import { useState } from 'react';
import type { AxisSubStep, CaptureState, InputItem } from '../hid-calibration.type';
import type { CalibrationRefs } from './report-subscription.type';

const useCalibrationItemState = (refs: CalibrationRefs) => {
  const { activeIdxRef, captureStateRef, axisSubStepRef, itemsRef, inputPhaseActiveRef, autoAdvanceRef } = refs;
  const [items, _setItems] = useState<InputItem[]>([]);
  const [activeIndex, _setActiveIndex] = useState(-1);
  const [captureState, _setCaptureState] = useState<CaptureState>('waiting-press');
  const [axisSubStep, _setAxisSubStep] = useState<AxisSubStep>('pos');
  const [inputPhaseActive, setInputPhaseActive] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);

  const setActiveIndex = (i: number) => { activeIdxRef.current = i; _setActiveIndex(i); };
  const setCaptureState = (s: CaptureState) => { captureStateRef.current = s; _setCaptureState(s); };
  const setAxisSubStep = (s: AxisSubStep) => { axisSubStepRef.current = s; _setAxisSubStep(s); };
  const setItems: typeof _setItems = (u) => {
    const next = typeof u === 'function' ? u(itemsRef.current) : u;
    itemsRef.current = next;
    _setItems(next);
  };
  const setInputPhaseActiveWrapped = (v: boolean) => { inputPhaseActiveRef.current = v; setInputPhaseActive(v); };
  const setAutoAdvanceWrapped = (v: boolean) => { autoAdvanceRef.current = v; setAutoAdvance(v); };

  return {
    items, activeIndex, captureState, axisSubStep, inputPhaseActive, autoAdvance,
    setItems, setActiveIndex, setCaptureState, setAxisSubStep, setInputPhaseActiveWrapped, setAutoAdvanceWrapped,
  };
};

export { useCalibrationItemState };
