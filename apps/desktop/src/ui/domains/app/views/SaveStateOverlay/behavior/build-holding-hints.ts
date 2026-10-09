/* @layer renderer-components @kind logic */
import type { FunctionMapping } from '@rotp/features';
import type { SlotHint } from '../SaveStateOverlay.type';
import { getSlotBinding } from './get-slot-binding';

const buildHoldingHints = (mappings: FunctionMapping[], slot: number): SlotHint[] => {
  return [{ action: 'holding-save', ...getSlotBinding(mappings, slot) }];
};

export { buildHoldingHints };
