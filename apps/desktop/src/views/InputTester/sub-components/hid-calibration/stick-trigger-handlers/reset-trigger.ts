/* @layer renderer-components @kind logic */
import type { InputStatus, TriggerSide } from '../hid-calibration.type';
import type { TriggerResetCallbacks, TriggerResetRefs } from './stick-trigger-handlers.type';

const resetTrigger = (side: TriggerSide, refs: TriggerResetRefs, latestBytesLen: number, cb: TriggerResetCallbacks): void => {
  const label = side === 'left' ? 'LEFT' : 'RIGHT';
  const axisId = side === 'left' ? 'leftTrigger' : 'rightTrigger';
  const prevByte = side === 'left' ? refs.leftTriggerByteRef.current : refs.rightTriggerByteRef.current;
  if (prevByte !== null) {
    refs.excludedRef.current.delete(prevByte);
    refs.capturedTriggerBytesRef.current.delete(prevByte);
  }
  if (side === 'left') refs.leftTriggerByteRef.current = null;
  else refs.rightTriggerByteRef.current = null;
  cb.setGyroExcluded(new Set(refs.excludedRef.current));
  cb.setItems(prev => prev.map(it =>
    it.id === axisId ? { ...it, status: 'pending' as InputStatus, result: undefined, axisMapping: undefined } : it
  ));
  cb.triggerRecordingRef.current = false;
  cb.setTriggerBusy(false);
  cb.setTriggerPickMode(false);
  cb.setTriggerPickedByte(null);
  cb.setTriggerLiveInfo('');
  cb.setActiveTrigger(null);
  refs.activeTriggerRef.current = null;
  if (latestBytesLen > 0) cb.updateByteStatuses(latestBytesLen);
  cb.addLog(`${label} trigger reset. Ready to redo.`);
};

export { resetTrigger };
