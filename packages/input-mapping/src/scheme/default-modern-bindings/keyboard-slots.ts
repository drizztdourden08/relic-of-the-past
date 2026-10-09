/* @layer shared-input @kind logic */
import { KEYBOARD_DEFAULT } from '../../keyboard-default';
import { GAMEPLAY_VERBS } from '../core-positions';
import { renumberSlots } from '../slot-list';
import { KEYBOARD_CORE_SOURCE } from './default-modern-bindings.constants';
import type { SnesButton } from '@rotp/game-data';
import type { ModernSlot } from '@rotp/game-data';

const keyboardSlots = (): ModernSlot[] => {
  const claimed = new Set<SnesButton>(GAMEPLAY_VERBS.map(verb => KEYBOARD_CORE_SOURCE[verb]));
  const free = KEYBOARD_DEFAULT.defaultMappings.filter(mapping => !claimed.has(mapping.snesButton));
  return renumberSlots(free.map((mapping, position) => ({
    index: position + 1,
    binding: mapping.binding,
    label: (mapping.binding.type === 'keyboard' ? mapping.binding.label : undefined) ?? mapping.snesButton,
    icon: mapping.icon,
  }))).slots;
};

export { keyboardSlots };
