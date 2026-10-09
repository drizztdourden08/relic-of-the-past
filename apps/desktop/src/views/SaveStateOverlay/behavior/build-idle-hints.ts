/* @layer renderer-components @kind logic */
import type { FunctionMapping } from '@rotp/features';
import type { BindingInfo, SlotHint } from '../SaveStateOverlay.type';
import { getSlotBinding } from './get-slot-binding';

const getEscBinding = (): BindingInfo => ({ binding: { type: 'keyboard', code: 'Escape' }, icon: null });

const buildIdleHints = (mappings: FunctionMapping[], slot: number): SlotHint[] => {
  const slotInfo = getSlotBinding(mappings, slot);
  const escInfo = getEscBinding();
  return [
    { action: 'tap-load', ...slotInfo },
    { action: 'hold-save', ...slotInfo },
    { action: 'esc-cancel', ...escInfo },
  ];
};

export { buildIdleHints };
