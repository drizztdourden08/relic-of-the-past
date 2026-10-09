/* @layer shared-input @kind logic */
import { KEYBOARD_DEFAULT } from '../../keyboard-default';
import { buildCore } from './build-core';
import { KEYBOARD_CORE_SOURCE, UNBOUND } from './default-modern-bindings.constants';
import { keyboardSlots } from './keyboard-slots';
import type { SnesButton, InputBinding, ModernBindings } from '@rotp/game-data';

const keyboardBindingFor = (snesButton: SnesButton): InputBinding => {
  return KEYBOARD_DEFAULT.defaultMappings.find(mapping => mapping.snesButton === snesButton)?.binding ?? UNBOUND;
};

const keyboardModernBindings = (): ModernBindings => {
  return {
    core: buildCore(verb => keyboardBindingFor(KEYBOARD_CORE_SOURCE[verb])),
    slots: keyboardSlots(),
  };
};

export { keyboardModernBindings };
