/* @layer shared-input @kind logic */
import { corePositions } from '../core-positions';
import { inPrefillOrder } from '../prefill-order';
import { renumberSlots } from '../slot-list';
import { deviceSlots } from './device-slots';
import type { ResolvedControl } from '../../family/family.type';
import type { CoreBindings, ModernSlot } from '../../../types/controls';

const defaultSlotList = (controls: readonly ResolvedControl[], core: CoreBindings): ModernSlot[] => {
  const claimed = corePositions(core);
  const free = deviceSlots(controls).filter((slot) => !slot.position || !claimed.has(slot.position));
  return renumberSlots(inPrefillOrder(free)).slots;
};

export { defaultSlotList };
