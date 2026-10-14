/* @layer renderer-components @kind logic */
import type { InputBinding } from '@rotp/game-data';

const keyboardBindingFromEvent = (e: KeyboardEvent): InputBinding => {
  const modifiers: { shift?: boolean; ctrl?: boolean; alt?: boolean } = {};
  if (e.shiftKey) modifiers.shift = true;
  if (e.ctrlKey) modifiers.ctrl = true;
  if (e.altKey) modifiers.alt = true;

  return {
    type: 'keyboard',
    code: e.code,
    ...(Object.keys(modifiers).length > 0 ? { modifiers } : {}),
  };
};

export { keyboardBindingFromEvent };
