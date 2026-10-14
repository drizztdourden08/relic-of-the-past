/* @layer renderer-components @kind logic */
import type { HidButtonMapping } from '../hid-calibration.type';
import type { TriggerFinalizeCallbacks, TriggerFinalizeRefs } from './stick-trigger-handlers.type';

const finalizeDigitalTrigger = (mapping: HidButtonMapping, refs: TriggerFinalizeRefs, cb: TriggerFinalizeCallbacks): void => {
  const side = refs.activeTriggerRef.current ?? 'left';
  const label = side === 'left' ? 'LEFT' : 'RIGHT';
  const axisId = side === 'left' ? 'leftTrigger' : 'rightTrigger';
  const result = `byte[${mapping.byteIndex}] bit 0x${mapping.bitMask.toString(16)} (digital)`;

  cb.addLog(`OK ${label} Trigger: ${result}`);
  cb.setItems(prev => prev.map(it =>
    it.id === axisId ? { ...it, status: 'captured', result, mapping } : it
  ));

  cb.setActiveTrigger(null);
  refs.activeTriggerRef.current = null;
  cb.setTriggerBusy(false);
  cb.setTriggerLiveInfo('');
  cb.addLog(`${label} trigger calibration done (digital, byte shared with buttons).`);
  cb.updateByteStatuses(refs.baselineRef.current.length);
};

export { finalizeDigitalTrigger };
