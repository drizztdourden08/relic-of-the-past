/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { isAnalogItem } from './is-analog-item';
import { isItemDone } from './is-item-done';
import type { UseDoAdvanceParams } from './hid-calibration-hook.type';

const useDoAdvance = (params: UseDoAdvanceParams) => {
  const { refs, itemState, addLog } = params;
  const { itemsRef, activeIdxRef, releaseCountRef, confirmCountRef, detectedBtnRef, awaitingButtonRestRef } = refs;
  const { setInputPhaseActiveWrapped, setActiveIndex, setCaptureState, setAxisSubStep, setItems } = itemState;

  return useCallback(() => {
    const curItems = itemsRef.current; const start = activeIdxRef.current + 1;
    const found = curItems.findIndex((it, i) => i >= start && !isAnalogItem(it) && !isItemDone(it));
    const nextIdx = found < 0 ? curItems.length : found;
    if (nextIdx >= curItems.length) { setInputPhaseActiveWrapped(false); addLog('All inputs mapped.'); return; }
    setActiveIndex(nextIdx); setCaptureState('waiting-press'); setAxisSubStep('pos');
    releaseCountRef.current = 0; confirmCountRef.current = 0; detectedBtnRef.current = null; awaitingButtonRestRef.current = true;
    setItems(prev => prev.map((it, i) => i === nextIdx ? { ...it, status: 'active' } : it));
  }, [addLog]);
};

export { useDoAdvance };
