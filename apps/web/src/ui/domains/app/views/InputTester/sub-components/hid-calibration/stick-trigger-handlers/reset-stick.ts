/* @layer renderer-components @kind logic */
import type { InputStatus, StickSide } from '../hid-calibration.type';
import type { StickResetCallbacks, StickResetRefs } from './stick-trigger-handlers.type';

const resetStick = (side: StickSide, refs: StickResetRefs, latestBytesLen: number, cb: StickResetCallbacks): void => {
  const label = side === 'left' ? 'LEFT' : 'RIGHT';
  const xId = side === 'left' ? 'leftX' : 'rightX';
  const yId = side === 'left' ? 'leftY' : 'rightY';
  const sideBytes = side === 'left' ? refs.leftStickBytesRef : refs.rightStickBytesRef;
  for (const b of sideBytes.current) {
    refs.excludedRef.current.delete(b);
    refs.capturedStickBytesRef.current.delete(b);
  }
  sideBytes.current = new Set();
  cb.setGyroExcluded(new Set(refs.excludedRef.current));
  cb.setItems(prev => prev.map(it =>
    (it.id === xId || it.id === yId) ? { ...it, status: 'pending' as InputStatus, result: undefined, axisMapping: undefined } : it
  ));
  cb.stickRecordingRef.current = false;
  cb.setStickBusy(false);
  cb.setStickPickMode(false);
  cb.setStickPickedBytes([]);
  cb.setStickLiveInfo('');
  cb.setActiveStick(null);
  refs.activeStickRef.current = null;
  if (latestBytesLen > 0) cb.updateByteStatuses(latestBytesLen);
  cb.addLog(`${label} stick reset. Ready to redo.`);
};

export { resetStick };
