/* @layer renderer-components @kind logic */
import type { HidAxisMapping, StickCandidate } from '../hid-calibration.type';
import type { TriggerFinalizeCallbacks, TriggerFinalizeRefs } from './stick-trigger-handlers.type';

const finalizeTriggerCalibration = (c: StickCandidate, refs: TriggerFinalizeRefs, cb: TriggerFinalizeCallbacks): void => {
  const side = refs.activeTriggerRef.current ?? 'left';
  const label = side === 'left' ? 'LEFT' : 'RIGHT';
  const axisId = side === 'left' ? 'leftTrigger' : 'rightTrigger';

  const mapping: HidAxisMapping = { byteIndex: c.idx, center: c.center, min: c.min, max: c.max, inverted: false };
  const result = `byte[${c.idx}] ${c.min}..${c.center}..${c.max} (range ${c.range})`;
  cb.addLog(`OK ${label} Trigger: ${result}`);

  refs.excludedRef.current.add(c.idx);
  refs.capturedTriggerBytesRef.current.add(c.idx);
  if (side === 'left') refs.leftTriggerByteRef.current = c.idx;
  else refs.rightTriggerByteRef.current = c.idx;

  cb.setGyroExcluded(new Set(refs.excludedRef.current));

  cb.setItems(prev => prev.map(it =>
    it.id === axisId ? { ...it, status: 'captured', result, axisMapping: mapping } : it
  ));

  cb.setActiveTrigger(null);
  refs.activeTriggerRef.current = null;
  cb.setTriggerBusy(false);
  cb.setTriggerLiveInfo('');
  cb.addLog(`${label} trigger calibration done.`);
  cb.updateByteStatuses(refs.baselineRef.current.length);
};

export { finalizeTriggerCalibration };
