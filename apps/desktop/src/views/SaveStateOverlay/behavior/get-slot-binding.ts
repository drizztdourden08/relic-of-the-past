/* @layer renderer-components @kind logic */
import { resolveFunctionMappingIcon } from '../../../game';
import type { FunctionMapping } from '@rotp/features';
import type { BindingInfo } from '../SaveStateOverlay.type';

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

export { getSlotBinding };
