/* @layer shared-input @kind logic */
import { MENU_CONSUMED_VERBS } from './menu-shadowed-slots.constants';
import { sameControl } from './same-control';
import type { ModernBindings, SlotIndex } from '../../types/controls';

const menuShadowedSlots = (bindings: ModernBindings): Set<SlotIndex> => {
  const verbs = MENU_CONSUMED_VERBS.map(verb => bindings.core[verb]);
  const shadowed = new Set<SlotIndex>();
  for (const slot of bindings.slots) {
    if (verbs.some(verb => sameControl(verb, slot.binding))) shadowed.add(slot.index);
  }
  return shadowed;
};

export { menuShadowedSlots };
