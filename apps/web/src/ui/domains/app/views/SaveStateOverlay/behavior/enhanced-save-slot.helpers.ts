/* @layer renderer-components @kind logic */
/**
 * Pure helper functions for the enhanced save slot state machine.
 *
 * Contains pause-guard logic, binding resolution, and hint builders.
 */

import { getInputManager, resolveFunctionMappingIcon } from '../../../../../../lib/game';
import type { FunctionMapping, InputBinding, ButtonIcon } from '@shared/types/controls';
import type { SlotHint } from './enhanced-save-slot.types';

type BindingInfo = { binding: InputBinding; icon: ButtonIcon | null };

const withPauseGuard = async (action: () => Promise<boolean>): Promise<boolean> => {
  const inputMgr = getInputManager();
  const wasPaused = inputMgr.isPaused();
  if (wasPaused) {
    inputMgr.resume();
    await new Promise(r => requestAnimationFrame(r));
  }
  const result = await action();
  if (wasPaused) {
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    inputMgr.togglePause();
  }
  return result;
};

const bindingInfo = (m: FunctionMapping): BindingInfo => ({
  binding: m.binding,
  icon: m.icon ?? resolveFunctionMappingIcon(m),
});

const getSlotBinding = (mappings: FunctionMapping[], slot: number): BindingInfo => {
  const loadMapping = mappings.find(m => m.action === `load-state-${slot + 1}` && m.binding.type !== 'none');
  if (loadMapping) return bindingInfo(loadMapping);
  const saveMapping = mappings.find(m => m.action === `save-state-${slot + 1}` && m.binding.type !== 'none');
  if (saveMapping) return bindingInfo(saveMapping);
  return { binding: { type: 'none' }, icon: null };
};

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

const buildHoldingHints = (mappings: FunctionMapping[], slot: number): SlotHint[] => {
  return [{ action: 'holding-save', ...getSlotBinding(mappings, slot) }];
};

export { withPauseGuard, getSlotBinding, getEscBinding, buildIdleHints, buildHoldingHints };
