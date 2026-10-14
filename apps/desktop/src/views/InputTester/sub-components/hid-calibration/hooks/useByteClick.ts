/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import type { ActionDeps, ByteClickParams } from './action-deps.type';

const useByteClick = (d: ActionDeps, handlers: ByteClickParams) => {
  const { handleStickBytePicked, handleTriggerBytePicked, handleManualByteAssign } = handlers;

  const handleByteClick = useCallback((idx: number) => {
    if (d.stickPickMode) { handleStickBytePicked(idx); return; }
    if (d.triggerPickMode) { handleTriggerBytePicked(idx); return; }
    const activeItem = d.itemsRef.current[d.activeIdxRef.current];
    if (activeItem?.status === 'active' && d.inputPhaseActiveRef.current) { handleManualByteAssign(idx); return; }

    const currentStatus = d.byteStatusesRef.current[idx] ?? 'unknown';
    const excl = new Set(d.excludedRef.current);
    if (currentStatus === 'excluded') {
      excl.delete(idx);
      d.addLog(`byte[${idx}] restored to unregistered`);
    } else {
      d.capturedStickBytesRef.current.delete(idx);
      d.capturedTriggerBytesRef.current.delete(idx);
      d.setItems(prev => prev.map(it => (it.mapping?.byteIndex === idx && it.status === 'captured')
        ? { ...it, status: 'pending', result: undefined, mapping: undefined, axisMapping: undefined }
        : it));
      excl.add(idx);
      d.addLog(`byte[${idx}] excluded`);
    }
    d.excludedRef.current = excl; d.setGyroExcluded(new Set(excl));
    if (d.latestBytes.length > 0) d.updateByteStatuses(d.latestBytes.length);
  }, [d.addLog, d.latestBytes.length, d.updateByteStatuses, d.stickPickMode, handleStickBytePicked, d.triggerPickMode, handleTriggerBytePicked, handleManualByteAssign, d.setItems]);

  return { handleByteClick };
};

export { useByteClick };
